# 🛍️ ShopAI — Personalized Product Recommendation System
> **Built by AIVONEX SMC-PVT LTD, Bahawalpur, Pakistan**
> AI-Powered E-Commerce Platform with Hybrid Machine Learning Recommendations

---

## 📌 Project Overview

ShopAI is a full-stack intelligent e-commerce platform that uses a **Hybrid Recommendation Engine** combining Collaborative Filtering and Content-Based AI to deliver personalized product recommendations to every user. The system tracks user behavior in real-time and continuously improves its suggestions.

---

## 🧠 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        ShopAI Platform                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌──────────────┐         ┌──────────────────────────┐    │
│   │   React UI   │ ──API──▶│     FastAPI Backend       │    │
│   │  (Port 5173) │◀──JSON──│     (Port 8000)           │    │
│   └──────────────┘         └──────────┬───────────────┘    │
│                                        │                    │
│                             ┌──────────▼───────────┐       │
│                             │   Hybrid ML Engine    │       │
│                             │  ┌─────────────────┐  │       │
│                             │  │ Content Filter  │  │       │
│                             │  │  (TF-IDF + cos) │  │       │
│                             │  ├─────────────────┤  │       │
│                             │  │ Collab Filter   │  │       │
│                             │  │ (Matrix Factor) │  │       │
│                             │  ├─────────────────┤  │       │
│                             │  │ Hybrid Blender  │  │       │
│                             │  │ CF(60%)+CBF(40%)│  │       │
│                             │  └─────────────────┘  │       │
│                             └──────────┬───────────┘       │
│                                        │                    │
│                             ┌──────────▼───────────┐       │
│                             │   SQLite Database     │       │
│                             │  Users, Products,     │       │
│                             │  Interactions, Cart   │       │
│                             └──────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Full Project Structure

```
ecommerce-recommender/
│
├── 📁 backend/                          # FastAPI Python Backend
│   ├── 🐳 Dockerfile
│   ├── ⚙️  .env                         # Environment variables
│   ├── 📦 requirements.txt
│   │
│   └── 📁 app/
│       ├── 🐍 main.py                   # App entry point, CORS, routers
│       │
│       ├── 📁 core/
│       │   ├── config.py               # Pydantic settings & env vars
│       │   ├── security.py             # JWT creation, bcrypt hashing
│       │   └── deps.py                 # Auth dependency injection
│       │
│       ├── 📁 models/
│       │   └── models.py               # SQLAlchemy ORM tables:
│       │                               #  User, Product, Category,
│       │                               #  Interaction, Cart, Order, Review
│       │
│       ├── 📁 database/
│       │   ├── db.py                   # SQLAlchemy engine + session
│       │   └── seed_data.py            # Auto-seeds 24 products, 5 users
│       │
│       ├── 📁 services/
│       │   └── recommendation_engine.py  ← 🧠 CORE AI ENGINE
│       │       ├── ContentBasedFilter    # TF-IDF + Cosine Similarity
│       │       ├── CollaborativeFilter   # Matrix Factorization (SGD)
│       │       └── HybridRecommender    # CF(60%) + CBF(40%) blend
│       │
│       └── 📁 api/routes/
│           ├── auth.py                 # POST /register /login GET /me
│           ├── products.py             # CRUD + /similar endpoint
│           ├── recommendations.py      # /for-you /trending /best-sellers
│           ├── interactions.py         # POST event logger
│           └── users.py               # Cart + Profile + Preferences
│
│
├── 📁 frontend/                         # React 18 + Vite + Tailwind
│   ├── 🐳 Dockerfile
│   ├── 📦 package.json
│   ├── ⚙️  vite.config.js               # Dev proxy → port 8000
│   ├── ⚙️  tailwind.config.js
│   ├── ⚙️  postcss.config.js
│   ├── 🌐 index.html
│   │
│   └── 📁 src/
│       ├── 🔧 main.jsx                  # React DOM entry point
│       ├── 🔧 App.jsx                   # Router + QueryClient + Guards
│       ├── 🎨 index.css                 # Global design system tokens
│       │
│       ├── 📁 services/
│       │   └── api.js                  # Axios client for all API calls
│       │                               # authAPI, productsAPI,
│       │                               # recommendAPI, usersAPI
│       │
│       ├── 📁 store/
│       │   └── index.js                # Zustand global state:
│       │                               #  useAuthStore   (JWT + user)
│       │                               #  useCartStore   (cart items)
│       │                               #  useWishlistStore (❤️ wishlist)
│       │                               #  useActivityStore (viewed/clicks)
│       │                               #  useUIStore     (sidebar toggle)
│       │
│       ├── 📁 components/
│       │   ├── 📁 layout/
│       │   │   ├── Navbar.jsx          # Top bar: search, cart, wishlist
│       │   │   ├── Sidebar.jsx         # Left nav: categories, activity
│       │   │   ├── Layout.jsx          # Shell: Navbar + Sidebar + Outlet
│       │   │   └── Footer.jsx
│       │   │
│       │   └── 📁 product/
│       │       ├── ProductCard.jsx     # Card with AI badge, wishlist,
│       │       │                       # score bar, hover cart button
│       │       └── ProductGrid.jsx     # Grid + Skeleton + ScrollableRow
│       │
│       └── 📁 pages/
│           ├── HomePage.jsx            # Hero + AI bar + All sections
│           ├── ProductsPage.jsx        # Search, filter, sort, paginate
│           ├── ProductDetailPage.jsx   # Detail + AI explanation + Similar
│           ├── RecommendationsPage.jsx # 4 tabs + Preference panel
│           ├── CartPage.jsx            # Cart + Order summary
│           ├── WishlistPage.jsx        # Saved products ❤️
│           ├── LoginPage.jsx           # Auth with demo credentials
│           ├── RegisterPage.jsx
│           └── ProfilePage.jsx         # Activity history + user info
│
├── 🐳 docker-compose.yml               # One-command full stack
└── 📄 README.md
```

---

## 🧠 Recommendation Engine — How It Works

### Interaction Scoring
Every user action generates an implicit score:

| Event     | Score | Description                  |
|-----------|-------|------------------------------|
| view      | 1.0   | User viewed the product page |
| click     | 1.5   | User clicked on product card |
| wishlist  | 2.0   | User added to wishlist       |
| cart      | 3.0   | User added to cart           |
| purchase  | 5.0   | User completed purchase      |

### Algorithm Flow

```
User visits site
       │
       ▼
Has 3+ interactions?
  ┌────┴────┐
  NO       YES
  │         │
  ▼         ▼
Popularity  Hybrid Engine
Ranking     ┌──────────────────┐
            │  CF Score × 0.60 │  ← Matrix Factorization
            │+ CBF Score × 0.40│  ← TF-IDF Cosine Sim
            └────────┬─────────┘
                     │
                     ▼
            Ranked Recommendations
            with Explainability Tags
```

### Cold-Start Strategy
- **New users** (< 3 interactions) → Popularity-based fallback
- **Returning users** → Full hybrid CF + CBF personalization
- **Session tracking** → Every click updates recommendations

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Option 1: Manual Setup (Recommended)

**Step 1 — Backend**
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start server (auto-creates DB + seeds data)
uvicorn app.main:app --reload --port 8000
```

**Step 2 — Frontend** *(new terminal)*
```bash
cd frontend
npm install
npm run dev
```

**Step 3 — Open browser**
```
http://localhost:5173
```

---

### Option 2: Docker (One Command)
```bash
docker-compose up --build
```

---

## 🔑 Demo Login Credentials

| Email                  | Password   | Profile           |
|------------------------|------------|-------------------|
| demo@aivonex.com       | demo1234   | General user      |
| alice@example.com      | alice123   | Fashion lover     |
| bob@example.com        | bob12345   | Tech enthusiast   |
| carol@example.com      | carol123   | Style guru        |
| dave@example.com       | dave1234   | Sports fan        |

---

## 📡 API Endpoints Reference

### Authentication
| Method | Endpoint             | Auth | Description         |
|--------|----------------------|------|---------------------|
| POST   | /api/auth/register   | ❌   | Create account      |
| POST   | /api/auth/login      | ❌   | Login, returns JWT  |
| GET    | /api/auth/me         | ✅   | Get current user    |

### Products
| Method | Endpoint                    | Auth | Description              |
|--------|-----------------------------|------|--------------------------|
| GET    | /api/products/              | ❌   | List with filters        |
| GET    | /api/products/featured      | ❌   | Featured products        |
| GET    | /api/products/categories    | ❌   | All categories           |
| GET    | /api/products/{id}          | ❌   | Single product detail    |
| GET    | /api/products/{id}/similar  | ❌   | Content-based similar    |

### Recommendations ⭐
| Method | Endpoint                            | Auth | Description              |
|--------|-------------------------------------|------|--------------------------|
| GET    | /api/recommendations/for-you        | ✅   | Personalized AI picks    |
| GET    | /api/recommendations/trending       | ❌   | Trending by interactions |
| GET    | /api/recommendations/best-sellers   | ❌   | Top rated products       |
| GET    | /api/recommendations/new-arrivals   | ❌   | Latest added products    |
| POST   | /api/recommendations/retrain        | ❌   | Retrain ML models        |

### User & Cart
| Method | Endpoint              | Auth | Description           |
|--------|-----------------------|------|-----------------------|
| GET    | /api/users/profile    | ✅   | Get user profile      |
| PUT    | /api/users/preferences| ✅   | Update preferences    |
| GET    | /api/users/cart       | ✅   | Get cart items        |
| POST   | /api/users/cart       | ✅   | Add item to cart      |
| DELETE | /api/users/cart/{id}  | ✅   | Remove from cart      |

### Interactions
| Method | Endpoint              | Auth | Description           |
|--------|-----------------------|------|-----------------------|
| POST   | /api/interactions/    | ✅   | Log user interaction  |
| GET    | /api/interactions/history | ✅ | User activity history |

**Interactive Swagger Docs:** `http://localhost:8000/docs`

---

## ⚙️ Configuration (.env)

```env
# Database
DATABASE_URL=sqlite:///./ecommerce_recommender.db

# Security
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Recommendation Engine Weights
COLLABORATIVE_WEIGHT=0.6        # CF contribution
CONTENT_WEIGHT=0.4              # CBF contribution
NUM_RECOMMENDATIONS=10
MIN_INTERACTIONS_FOR_CF=3       # Cold-start threshold

# ML Model Parameters
MATRIX_FACTORS=50               # Latent dimensions
LEARNING_RATE=0.01
REGULARIZATION=0.01
EPOCHS=100
```

---

## 🎨 Frontend Features

| Feature                  | Description                                          |
|--------------------------|------------------------------------------------------|
| 🎯 Personalized Feed     | AI picks updated on every interaction                |
| 🔥 Trending Section      | Most interacted products this week                   |
| 👁️ Recently Viewed       | Session-tracked browsing history                     |
| ❤️ Wishlist              | Save products with persistent local storage          |
| 🤖 AI Badges             | "AI Recommended", "Best Match", "Trending" labels    |
| 📊 Match Score Bar       | Visual AI confidence score per recommendation        |
| 💡 Explainable AI        | "Why recommended?" panel on product detail pages     |
| 🗂️ Smart Sidebar         | Categories + Activity + Premium upgrade panel        |
| 🛒 Cart Intelligence     | Cart with order summary and live totals              |
| 🎁 Refer & Earn          | Social sharing and rewards section                   |
| 🔒 Trust Indicators      | Shipping, returns, payment security badges           |
| 📱 Responsive Design     | Works on all screen sizes                            |

---

## 🛠️ Tech Stack

### Backend
| Technology        | Purpose                        |
|-------------------|--------------------------------|
| FastAPI           | REST API framework             |
| SQLAlchemy        | ORM + database management      |
| SQLite            | Database (dev) / PostgreSQL (prod) |
| Scikit-learn      | TF-IDF vectorizer + ML models  |
| NumPy / SciPy     | Matrix operations              |
| python-jose       | JWT authentication             |
| passlib + bcrypt  | Password hashing               |
| Pydantic          | Data validation & settings     |
| Uvicorn           | ASGI server                    |

### Frontend
| Technology        | Purpose                        |
|-------------------|--------------------------------|
| React 18          | UI framework                   |
| Vite              | Build tool + dev server        |
| Tailwind CSS      | Utility-first styling          |
| Zustand           | Global state management        |
| TanStack Query    | Server state + caching         |
| React Router v6   | Client-side routing            |
| Axios             | HTTP client                    |
| Lucide React      | Icon library                   |
| React Hot Toast   | Notification toasts            |

---

## 🔧 Common Issues & Fixes

| Error | Fix |
|-------|-----|
| `metadata reserved` | Rename `metadata` column to `meta_data` in models.py |
| `No module email-validator` | `pip install email-validator` |
| `bcrypt version error` | `pip install bcrypt==4.0.1` |
| `scikit-learn==1.4.1 not found` | Use `scikit-learn>=1.3.0` in requirements.txt |
| Blank white page | Check F12 Console for JS errors; reinstall with `npm install` |
| Port 8000 in use | Kill process or use `--port 8001` |

---

## 🗺️ Roadmap

- [ ] **Phase 2:** PostgreSQL + Redis caching
- [ ] **Phase 2:** Neural Collaborative Filtering (PyTorch NCF)
- [ ] **Phase 2:** BERT-based semantic search
- [ ] **Phase 3:** Real-time recommendations via WebSockets
- [ ] **Phase 3:** A/B testing framework
- [ ] **Phase 3:** Admin analytics dashboard
- [ ] **Phase 3:** Email digest with weekly personalized picks
- [ ] **Phase 4:** Mobile app (React Native)

---

## 👥 Team

**AIVONEX SMC-PVT LTD**
Bahawalpur, Punjab, Pakistan

- **CEO & Founder:** Sana Arif
- **AI/ML Engineering:** AIVONEX Team
- **Affiliation:** Islamia University of Bahawalpur

---

## 📄 License

This project is proprietary software developed by AIVONEX SMC-PVT LTD.
All rights reserved © 2024 AIVONEX.

---

*Built with ❤️ by AIVONEX — Delivering AI Intelligence, One Project at a Time.*
