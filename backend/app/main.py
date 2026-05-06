from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import uvicorn

from app.database.db import engine, Base
from app.api.routes import products, users, recommendations, auth, interactions
from app.database.seed_data import seed_database
from app.core.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed data
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield
    # Shutdown

app = FastAPI(
    title="AIVONEX Recommendation Engine API",
    description="Personalized Product Recommendation System for E-Commerce",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router,            prefix="/api/auth",            tags=["Authentication"])
app.include_router(users.router,           prefix="/api/users",           tags=["Users"])
app.include_router(products.router,        prefix="/api/products",        tags=["Products"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["Recommendations"])
app.include_router(interactions.router,    prefix="/api/interactions",    tags=["Interactions"])

@app.get("/")
def root():
    return {"message": "AIVONEX Recommendation Engine API v1.0", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
