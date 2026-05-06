from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List
from app.database.db import get_db
from app.models.models import Product, Category
from app.services.recommendation_engine import recommender

router = APIRouter()

def product_to_dict(p: Product) -> dict:
    discount = 0
    if p.original_price and p.original_price > p.price:
        discount = round((1 - p.price / p.original_price) * 100)
    return {
        "id": p.id,
        "name": p.name,
        "description": p.description,
        "price": p.price,
        "original_price": p.original_price,
        "discount_percent": discount,
        "category_id": p.category_id,
        "category_name": p.category.name if p.category else None,
        "category_slug": p.category.slug if p.category else None,
        "brand": p.brand,
        "image_url": p.image_url,
        "images": p.images or [],
        "tags": p.tags or [],
        "features": p.features or {},
        "stock": p.stock,
        "rating": p.rating,
        "review_count": p.review_count,
        "is_featured": p.is_featured,
        "created_at": str(p.created_at),
    }

@router.get("/")
def list_products(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    brand: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    sort: Optional[str] = Query("newest"),   # newest, price_asc, price_desc, rating, popular
    featured: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=48),
    db: Session = Depends(get_db),
):
    query = db.query(Product).filter(Product.is_active == True)

    if category:
        cat = db.query(Category).filter(Category.slug == category).first()
        if cat:
            query = query.filter(Product.category_id == cat.id)

    if search:
        query = query.filter(
            or_(Product.name.ilike(f"%{search}%"), Product.brand.ilike(f"%{search}%"))
        )
    if brand:
        query = query.filter(Product.brand.ilike(f"%{brand}%"))
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    if featured is not None:
        query = query.filter(Product.is_featured == featured)

    if sort == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort == "rating":
        query = query.order_by(Product.rating.desc())
    elif sort == "popular":
        query = query.order_by(Product.review_count.desc())
    else:
        query = query.order_by(Product.created_at.desc())

    total = query.count()
    products = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "products": [product_to_dict(p) for p in products],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
    }

@router.get("/featured")
def featured_products(limit: int = 8, db: Session = Depends(get_db)):
    products = (
        db.query(Product)
        .filter(Product.is_active == True, Product.is_featured == True)
        .order_by(Product.rating.desc())
        .limit(limit)
        .all()
    )
    return [product_to_dict(p) for p in products]

@router.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    cats = db.query(Category).all()
    return [{"id": c.id, "name": c.name, "slug": c.slug, "icon": c.icon, "description": c.description} for c in cats]

@router.get("/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_to_dict(product)

@router.get("/{product_id}/similar")
def similar_products(product_id: int, n: int = 6, db: Session = Depends(get_db)):
    if not recommender._initialized:
        recommender.initialize(db)
    similar = recommender.get_similar_products(product_id, n)
    if not similar:
        # fallback: same category
        product = db.query(Product).filter(Product.id == product_id).first()
        if product:
            products = (
                db.query(Product)
                .filter(Product.category_id == product.category_id, Product.id != product_id)
                .order_by(Product.rating.desc())
                .limit(n)
                .all()
            )
            return [product_to_dict(p) for p in products]
        return []
    ids = [pid for pid, _ in similar]
    products = db.query(Product).filter(Product.id.in_(ids)).all()
    product_map = {p.id: product_to_dict(p) for p in products}
    return [product_map[pid] for pid in ids if pid in product_map]
