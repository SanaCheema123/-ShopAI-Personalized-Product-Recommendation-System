from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database.db import get_db
from app.core.deps import get_current_user
from app.models.models import User, Product
from app.services.recommendation_engine import recommender
from app.api.routes.products import product_to_dict

router = APIRouter()

@router.get("/for-you")
def personalized_recommendations(
    n: int = Query(10, ge=1, le=20),
    category: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get personalized product recommendations for the logged-in user."""
    if not recommender._initialized:
        recommender.initialize(db)

    recs = recommender.recommend(db, current_user.id, n=n, category_filter=category)
    return [
        {**product_to_dict(r["product"]), "recommendation_score": r["score"], "reason": r["reason"]}
        for r in recs
    ]

@router.get("/trending")
def trending_products(n: int = 10, db: Session = Depends(get_db)):
    """Get trending products by interaction count."""
    from sqlalchemy import func
    from app.models.models import Interaction
    trending_ids = (
        db.query(Interaction.product_id, func.count(Interaction.id).label("cnt"))
        .group_by(Interaction.product_id)
        .order_by(func.count(Interaction.id).desc())
        .limit(n)
        .all()
    )
    ids = [row[0] for row in trending_ids]
    if not ids:
        products = db.query(Product).filter(Product.is_active == True).order_by(Product.review_count.desc()).limit(n).all()
        return [product_to_dict(p) for p in products]
    products = db.query(Product).filter(Product.id.in_(ids)).all()
    product_map = {p.id: p for p in products}
    return [product_to_dict(product_map[pid]) for pid in ids if pid in product_map]

@router.get("/new-arrivals")
def new_arrivals(n: int = 8, db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.is_active == True).order_by(Product.created_at.desc()).limit(n).all()
    return [product_to_dict(p) for p in products]

@router.get("/best-sellers")
def best_sellers(n: int = 8, db: Session = Depends(get_db)):
    products = (
        db.query(Product)
        .filter(Product.is_active == True)
        .order_by(Product.review_count.desc(), Product.rating.desc())
        .limit(n)
        .all()
    )
    return [product_to_dict(p) for p in products]

@router.post("/retrain")
def retrain_model(db: Session = Depends(get_db)):
    """Re-initialize the recommendation engine with latest data."""
    recommender.initialize(db)
    return {"message": "Recommendation engine retrained successfully"}
