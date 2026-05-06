from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database.db import get_db
from app.core.deps import get_current_user
from app.models.models import User, Interaction, CartItem, Product

router = APIRouter()

EVENT_WEIGHTS = {"view": 1.0, "click": 1.5, "wishlist": 2.0, "cart": 3.0, "purchase": 5.0}

class InteractionCreate(BaseModel):
    product_id: int
    event_type: str   # view | click | wishlist | cart | purchase
    rating: Optional[float] = None

@router.post("/")
def log_interaction(
    data: InteractionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.event_type not in EVENT_WEIGHTS:
        raise HTTPException(status_code=400, detail=f"Invalid event_type. Must be one of {list(EVENT_WEIGHTS.keys())}")
    
    score = EVENT_WEIGHTS.get(data.event_type, 1.0)
    if data.rating:
        score = data.rating  # explicit rating overrides implicit score

    interaction = Interaction(
        user_id=current_user.id,
        product_id=data.product_id,
        event_type=data.event_type,
        rating=data.rating,
        implicit_score=round(score, 2),
    )
    db.add(interaction)
    db.commit()
    return {"message": "Interaction logged", "score": score}

@router.get("/history")
def interaction_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    interactions = (
        db.query(Interaction)
        .filter(Interaction.user_id == current_user.id)
        .order_by(Interaction.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {"product_id": i.product_id, "event_type": i.event_type, "score": i.implicit_score, "created_at": str(i.created_at)}
        for i in interactions
    ]
