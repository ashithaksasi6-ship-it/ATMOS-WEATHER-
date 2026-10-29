from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "Atmos Weather API"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # CORS settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]
    
    # Upstream APIs
    OPEN_METEO_FORECAST_URL: str = "https://api.open-meteo.com/v1/forecast"
    OPEN_METEO_GEOCODING_URL: str = "https://geocoding-api.open-meteo.com/v1/search"
    OPEN_METEO_AIR_QUALITY_URL: str = "https://air-quality-api.open-meteo.com/v1/air-quality"
    
    # HTTP Client timeouts (seconds)
    REQUEST_TIMEOUT: float = 10.0
    
    # Cache settings (seconds)
    CACHE_TTL_WEATHER: int = 600       # 10 minutes
    CACHE_TTL_GEOCODING: int = 86400   # 24 hours
    CACHE_TTL_AIR_QUALITY: int = 1800  # 30 minutes

    # Groq AI Provider (optional - defaults to rule-based engine if key is absent)
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "qwen/qwen3.8-27b"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
