from sqlalchemy.orm import Session
from app.database.db import SessionLocal
from app.models.models import User, Category, Product, Interaction, Review
from app.core.security import get_password_hash
import random, json

CATEGORIES = [
    {"name": "Electronics",    "slug": "electronics",    "icon": "💻", "description": "Latest gadgets and devices"},
    {"name": "Clothing",       "slug": "clothing",       "icon": "👕", "description": "Fashion for everyone"},
    {"name": "Home & Garden",  "slug": "home-garden",    "icon": "🏡", "description": "Make your home beautiful"},
    {"name": "Sports",         "slug": "sports",         "icon": "⚽", "description": "Sports and outdoor gear"},
    {"name": "Books",          "slug": "books",          "icon": "📚", "description": "Knowledge and entertainment"},
    {"name": "Beauty",         "slug": "beauty",         "icon": "💄", "description": "Skincare and cosmetics"},
    {"name": "Toys",           "slug": "toys",           "icon": "🧸", "description": "Fun for all ages"},
    {"name": "Automotive",     "slug": "automotive",     "icon": "🚗", "description": "Car accessories & parts"},
]

PRODUCTS = [
    # Electronics
    {"name": "Sony WH-1000XM5 Headphones",       "price": 349.99, "original_price": 399.99, "category": "electronics", "brand": "Sony",       "rating": 4.8, "review_count": 2341, "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", "tags": ["wireless", "noise-cancelling", "premium"], "is_featured": True},
    {"name": "Apple MacBook Air M2",              "price": 1099.00, "original_price": 1299.00,"category": "electronics", "brand": "Apple",      "rating": 4.9, "review_count": 4521, "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400", "tags": ["laptop", "apple", "m2"], "is_featured": True},
    {"name": "Samsung Galaxy S24 Ultra",          "price": 1199.99,"original_price": 1399.99,"category": "electronics", "brand": "Samsung",    "rating": 4.7, "review_count": 1823, "image_url": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400", "tags": ["smartphone", "android", "camera"], "is_featured": True},
    {"name": "iPad Pro 12.9-inch M4",            "price": 999.00, "original_price": 1099.00, "category": "electronics", "brand": "Apple",      "rating": 4.8, "review_count": 987,  "image_url": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400", "tags": ["tablet", "apple", "display"]},
    {"name": "LG 4K OLED Smart TV 55\"",         "price": 1299.00,"original_price": 1599.00,"category": "electronics", "brand": "LG",         "rating": 4.6, "review_count": 756,  "image_url": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400", "tags": ["tv", "4k", "oled"]},
    {"name": "Bose QuietComfort Earbuds II",      "price": 249.99, "original_price": 299.99, "category": "electronics", "brand": "Bose",       "rating": 4.5, "review_count": 1234, "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400", "tags": ["earbuds", "wireless", "noise-cancelling"]},
    {"name": "DJI Mini 4 Pro Drone",             "price": 759.00, "original_price": 799.00, "category": "electronics", "brand": "DJI",        "rating": 4.7, "review_count": 432,  "image_url": "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400", "tags": ["drone", "camera", "4k"]},
    {"name": "Logitech MX Master 3S Mouse",      "price": 99.99,  "original_price": 119.99, "category": "electronics", "brand": "Logitech",   "rating": 4.8, "review_count": 3421, "image_url": "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400", "tags": ["mouse", "wireless", "productivity"]},
    # Clothing
    {"name": "Nike Air Force 1 Sneakers",        "price": 110.00, "original_price": 130.00, "category": "clothing",    "brand": "Nike",       "rating": 4.6, "review_count": 5678, "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", "tags": ["sneakers", "casual", "white"], "is_featured": True},
    {"name": "Levi's 501 Original Jeans",        "price": 59.99,  "original_price": 79.99,  "category": "clothing",    "brand": "Levi's",     "rating": 4.5, "review_count": 8923, "image_url": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400", "tags": ["jeans", "denim", "classic"]},
    {"name": "Adidas Ultraboost 23",             "price": 179.99, "original_price": 199.99, "category": "clothing",    "brand": "Adidas",     "rating": 4.7, "review_count": 2341, "image_url": "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400", "tags": ["running", "shoes", "comfort"]},
    {"name": "North Face Puffer Jacket",         "price": 229.00, "original_price": 299.00, "category": "clothing",    "brand": "North Face", "rating": 4.8, "review_count": 1256, "image_url": "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=400", "tags": ["jacket", "winter", "outdoor"]},
    # Home & Garden
    {"name": "Dyson V15 Detect Vacuum",          "price": 699.99, "original_price": 799.99, "category": "home-garden", "brand": "Dyson",      "rating": 4.7, "review_count": 1876, "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "tags": ["vacuum", "cordless", "smart"], "is_featured": True},
    {"name": "KitchenAid Stand Mixer",           "price": 379.99, "original_price": 449.99, "category": "home-garden", "brand": "KitchenAid", "rating": 4.9, "review_count": 4321, "image_url": "https://images.unsplash.com/photo-1594834749598-c69cca46aef6?w=400", "tags": ["kitchen", "baking", "mixer"]},
    {"name": "Instant Pot Duo 7-in-1",           "price": 79.95,  "original_price": 99.95,  "category": "home-garden", "brand": "Instant Pot","rating": 4.7, "review_count": 12453,"image_url": "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400", "tags": ["cooker", "pressure", "multifunctional"]},
    # Sports
    {"name": "Peloton Bike+",                    "price": 2495.00,"original_price": 2795.00,"category": "sports",      "brand": "Peloton",    "rating": 4.6, "review_count": 876,  "image_url": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400", "tags": ["bike", "fitness", "indoor"], "is_featured": True},
    {"name": "Garmin Forerunner 965 Watch",      "price": 599.99, "original_price": 649.99, "category": "sports",      "brand": "Garmin",     "rating": 4.7, "review_count": 543,  "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", "tags": ["smartwatch", "running", "gps"]},
    {"name": "Wilson Pro Staff Tennis Racket",   "price": 229.00, "original_price": 269.00, "category": "sports",      "brand": "Wilson",     "rating": 4.5, "review_count": 321,  "image_url": "https://images.unsplash.com/photo-1617083277974-9f039e0ad00a?w=400", "tags": ["tennis", "racket", "pro"]},
    # Books
    {"name": "Atomic Habits - James Clear",      "price": 16.99,  "original_price": 27.00,  "category": "books",       "brand": "Penguin",    "rating": 4.9, "review_count": 45231,"image_url": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400", "tags": ["self-help", "habits", "bestseller"], "is_featured": True},
    {"name": "Deep Learning - Goodfellow",       "price": 69.99,  "original_price": 89.99,  "category": "books",       "brand": "MIT Press",  "rating": 4.8, "review_count": 2134, "image_url": "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400", "tags": ["ai", "machine-learning", "technical"]},
    # Beauty
    {"name": "Fenty Beauty Pro Filt'r Foundation","price": 38.00, "original_price": 45.00,  "category": "beauty",      "brand": "Fenty",      "rating": 4.6, "review_count": 8765, "image_url": "https://images.unsplash.com/photo-1631730486784-74757d38e388?w=400", "tags": ["foundation", "makeup", "inclusive"]},
    {"name": "The Ordinary Serum Set",           "price": 45.99,  "original_price": 59.99,  "category": "beauty",      "brand": "The Ordinary","rating": 4.7,"review_count": 5432, "image_url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400", "tags": ["skincare", "serum", "anti-aging"]},
    # Toys
    {"name": "LEGO Technic Bugatti Chiron",      "price": 349.99, "original_price": 399.99, "category": "toys",        "brand": "LEGO",       "rating": 4.9, "review_count": 2341, "image_url": "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400", "tags": ["lego", "building", "collectible"]},
    {"name": "Nintendo Switch OLED",             "price": 349.99, "original_price": 349.99, "category": "toys",        "brand": "Nintendo",   "rating": 4.8, "review_count": 7654, "image_url": "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400", "tags": ["gaming", "console", "portable"], "is_featured": True},
]

DEMO_USERS = [
    {"email": "demo@aivonex.com",   "username": "demo_user",    "full_name": "Demo User",       "password": "demo1234"},
    {"email": "alice@example.com",  "username": "alice_shop",   "full_name": "Alice Johnson",   "password": "alice123"},
    {"email": "bob@example.com",    "username": "bob_techie",   "full_name": "Bob Smith",       "password": "bob12345"},
    {"email": "carol@example.com",  "username": "carol_style",  "full_name": "Carol Williams",  "password": "carol123"},
    {"email": "dave@example.com",   "username": "dave_sports",  "full_name": "Dave Martinez",   "password": "dave1234"},
]

def seed_database():
    db: Session = SessionLocal()
    try:
        if db.query(User).count() > 0:
            return  # Already seeded

        # Seed categories
        cat_map = {}
        for cat_data in CATEGORIES:
            cat = Category(**cat_data)
            db.add(cat)
            db.flush()
            cat_map[cat_data["slug"]] = cat.id

        # Seed products
        product_ids = []
        for p_data in PRODUCTS:
            cat_slug = p_data.pop("category")
            p_data["category_id"] = cat_map.get(cat_slug, 1)
            p_data["description"] = f"High-quality {p_data['name']} — featuring premium build quality and outstanding performance."
            product = Product(**p_data)
            db.add(product)
            db.flush()
            product_ids.append(product.id)

        # Seed users
        user_ids = []
        for u_data in DEMO_USERS:
            pwd = u_data.pop("password")
            u_data["hashed_password"] = get_password_hash(pwd)
            u_data["avatar_url"] = f"https://api.dicebear.com/7.x/avataaars/svg?seed={u_data['username']}"
            user = User(**u_data)
            db.add(user)
            db.flush()
            user_ids.append(user.id)

        # Seed realistic interactions
        event_weights = {"view": 1.0, "click": 1.5, "wishlist": 2.0, "cart": 3.0, "purchase": 5.0}
        for user_id in user_ids:
            # Each user interacts with a random subset of products
            interacted = random.sample(product_ids, min(15, len(product_ids)))
            for product_id in interacted:
                event = random.choice(list(event_weights.keys()))
                score = event_weights[event] + random.uniform(-0.2, 0.2)
                inter = Interaction(
                    user_id=user_id,
                    product_id=product_id,
                    event_type=event,
                    implicit_score=round(score, 2)
                )
                db.add(inter)

                # Some users also leave reviews
                if event == "purchase" and random.random() > 0.4:
                    rating = round(random.uniform(3.5, 5.0), 1)
                    review = Review(
                        user_id=user_id,
                        product_id=product_id,
                        rating=rating,
                        title=random.choice(["Great product!", "Highly recommended", "Worth every penny", "Love it!"]),
                        body="This product exceeded my expectations. Really happy with the quality and performance."
                    )
                    db.add(review)

        db.commit()
        print("✅ Database seeded successfully with products, users, and interactions.")
    except Exception as e:
        db.rollback()
        print(f"⚠️  Seed error: {e}")
    finally:
        db.close()
