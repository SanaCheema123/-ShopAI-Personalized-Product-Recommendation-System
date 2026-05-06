from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.db import Base

class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    email         = Column(String, unique=True, index=True, nullable=False)
    username      = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name     = Column(String)
    avatar_url    = Column(String, default="https://api.dicebear.com/7.x/avataaars/svg?seed=default")
    is_active     = Column(Boolean, default=True)
    preferences   = Column(JSON, default={})       # {"categories": [], "price_range": []}
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), onupdate=func.now())

    interactions  = relationship("Interaction", back_populates="user")
    cart_items    = relationship("CartItem", back_populates="user")
    orders        = relationship("Order", back_populates="user")
    reviews       = relationship("Review", back_populates="user")


class Category(Base):
    __tablename__ = "categories"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String, unique=True, nullable=False)
    slug        = Column(String, unique=True, nullable=False)
    icon        = Column(String)
    description = Column(Text)

    products    = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id           = Column(Integer, primary_key=True, index=True)
    name         = Column(String, nullable=False, index=True)
    description  = Column(Text)
    price        = Column(Float, nullable=False)
    original_price = Column(Float)
    category_id  = Column(Integer, ForeignKey("categories.id"))
    brand        = Column(String)
    image_url    = Column(String)
    images       = Column(JSON, default=[])          # list of image URLs
    tags         = Column(JSON, default=[])          # ["wireless", "noise-cancelling"]
    features     = Column(JSON, default={})          # {"color": "black", "weight": "200g"}
    stock        = Column(Integer, default=100)
    rating       = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    is_featured  = Column(Boolean, default=False)
    is_active    = Column(Boolean, default=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())

    category     = relationship("Category", back_populates="products")
    interactions = relationship("Interaction", back_populates="product")
    cart_items   = relationship("CartItem", back_populates="product")
    order_items  = relationship("OrderItem", back_populates="product")
    reviews      = relationship("Review", back_populates="product")


class Interaction(Base):
    """Tracks all user-product interactions for collaborative filtering."""
    __tablename__ = "interactions"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id   = Column(Integer, ForeignKey("products.id"), nullable=False)
    event_type   = Column(String, nullable=False)   # view, click, cart, purchase, wishlist, review
    rating       = Column(Float, nullable=True)     # 1-5 stars (only for review events)
    implicit_score = Column(Float, default=0.0)     # computed engagement weight
    meta_data    = Column(JSON, default={})
    created_at   = Column(DateTime(timezone=True), server_default=func.now())

    user         = relationship("User", back_populates="interactions")
    product      = relationship("Product", back_populates="interactions")


class CartItem(Base):
    __tablename__ = "cart_items"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity   = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user       = relationship("User", back_populates="cart_items")
    product    = relationship("Product", back_populates="cart_items")


class Order(Base):
    __tablename__ = "orders"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    status     = Column(String, default="pending")   # pending, confirmed, shipped, delivered
    total      = Column(Float, nullable=False)
    address    = Column(JSON, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user       = relationship("User", back_populates="orders")
    items      = relationship("OrderItem", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id         = Column(Integer, primary_key=True, index=True)
    order_id   = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity   = Column(Integer, default=1)
    unit_price = Column(Float, nullable=False)

    order      = relationship("Order", back_populates="items")
    product    = relationship("Product", back_populates="order_items")


class Review(Base):
    __tablename__ = "reviews"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    rating     = Column(Float, nullable=False)
    title      = Column(String)
    body       = Column(Text)
    helpful    = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user       = relationship("User", back_populates="reviews")
    product    = relationship("Product", back_populates="reviews")
