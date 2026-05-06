from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # App
    APP_NAME: str = "AIVONEX Recommendation Engine"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "sqlite:///./ecommerce_recommender.db"
    
    # JWT
    SECRET_KEY: str = "aivonex-super-secret-key-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]
    
    # Recommendation Engine
    NUM_RECOMMENDATIONS: int = 10
    COLLABORATIVE_WEIGHT: float = 0.6
    CONTENT_WEIGHT: float = 0.4
    MIN_INTERACTIONS_FOR_CF: int = 3  # min user interactions before using CF
    
    # ML Model
    MATRIX_FACTORS: int = 50
    REGULARIZATION: float = 0.01
    LEARNING_RATE: float = 0.01
    EPOCHS: int = 100

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
