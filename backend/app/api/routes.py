from fastapi import APIRouter, Query, HTTPException, status
from typing import List, Optional
import logging
from app.schemas.weather import (
    LocationItem,
    WeatherForecastResponse,
    AirQualityResponse,
    AssistantChatRequest,
    AssistantChatResponse,
)
from app.services.geocoding import geocoding_service
from app.services.weather import weather_service
from app.services.air_quality import air_quality_service
from app.services.assistant import weather_assistant_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "service": "Atmos Weather API",
        "version": "1.0.0"
    }


@router.get("/locations/search", response_model=List[LocationItem], tags=["Locations"])
async def search_locations(
    q: str = Query(..., min_length=2, max_length=100, description="City name or query"),
    count: int = Query(8, ge=1, le=20)
):
    try:
        results = await geocoding_service.search_locations(q, count)
        return results
    except Exception as e:
        logger.error(f"Error searching locations for '{q}': {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to retrieve location suggestions"
        )


@router.get("/weather/forecast", response_model=WeatherForecastResponse, tags=["Weather"])
async def get_forecast(
    latitude: float = Query(..., ge=-90.0, le=90.0, description="Latitude coordinate"),
    longitude: float = Query(..., ge=-180.0, le=180.0, description="Longitude coordinate"),
):
    try:
        forecast = await weather_service.get_forecast(latitude, longitude)
        if not forecast:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Weather data not found for given coordinates"
            )
        return forecast
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching forecast for ({latitude}, {longitude}): {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to fetch forecast from weather provider"
        )


@router.get("/air-quality", response_model=AirQualityResponse, tags=["Air Quality"])
async def get_air_quality(
    latitude: float = Query(..., ge=-90.0, le=90.0, description="Latitude coordinate"),
    longitude: float = Query(..., ge=-180.0, le=180.0, description="Longitude coordinate"),
):
    try:
        aqi = await air_quality_service.get_air_quality(latitude, longitude)
        if not aqi:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Air quality data unavailable for given coordinates"
            )
        return aqi
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching air quality for ({latitude}, {longitude}): {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to fetch air quality data"
        )


@router.post("/assistant/chat", response_model=AssistantChatResponse, tags=["Assistant"])
async def assistant_chat(request: AssistantChatRequest):
    try:
        response = await weather_assistant_service.generate_response(request)
        return response
    except Exception as e:
        logger.error(f"Assistant generation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate assistant response"
        )
