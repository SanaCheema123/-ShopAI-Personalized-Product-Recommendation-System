from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.database.db import get_db
from app.core.deps import get_current_user
from app.models.models import User, CartItem, Product
from app.api.routes.products import product_to_dict

router = APIRouter()

class UpdatePreferences(BaseModel):
    categories: Optional[List[str]] = None
    price_range: Optional[List[float]] = None

class CartAction(BaseModel):
    product_id: int
    quantity: int = 1

@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "avatar_url": current_user.avatar_url,
        "preferences": current_user.preferences or {},
    }

@router.put("/preferences")
def update_preferences(
    data: UpdatePreferences,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    prefs = current_user.preferences or {}
    if data.categories is not None:
        prefs["categories"] = data.categories
    if data.price_range is not None:
        prefs["price_range"] = data.price_range
    current_user.preferences = prefs
    db.commit()
    return {"message": "Preferences updated", "preferences": prefs}

@router.get("/cart")
def get_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    result = []
    total = 0.0
    for item in items:
        if item.product:
            pd = product_to_dict(item.product)
            result.append({"cart_item_id": item.id, "quantity": item.quantity, "product": pd})
            total += item.product.price * item.quantity
    return {"items": result, "total": round(total, 2), "count": len(result)}

@router.post("/cart")
def add_to_cart(data: CartAction, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(CartItem).filter(
        CartItem.user_id == current_user.id, CartItem.product_id == data.product_id
    ).first()
    if existing:
        existing.quantity += data.quantity
    else:
        cart_item = CartItem(user_id=current_user.id, product_id=data.product_id, quantity=data.quantity)
        db.add(cart_item)
    db.commit()
    return {"message": "Added to cart"}

@router.delete("/cart/{item_id}")
def remove_from_cart(item_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(item)
    db.commit()
    return {"message": "Removed from cart"}
