import httpx
import logging
from typing import List, Optional
from app.core.config import settings
from app.schemas.weather import LocationItem, LocationSearchResponse
from app.services.cache import cache_service

logger = logging.getLogger(__name__)


class GeocodingService:
    async def search_locations(self, query: str, count: int = 8) -> List[LocationItem]:
        query_clean = query.strip()
        if not query_clean or len(query_clean) < 2:
            return []

        cache_key = f"geocoding:{query_clean.lower()}:{count}"
        cached = await cache_service.get(cache_key)
        if cached is not None:
            return [LocationItem(**item) for item in cached]

        params = {
            "name": query_clean,
            "count": count,
            "language": "en",
            "format": "json"
        }

        try:
            async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT) as client:
                response = await client.get(settings.OPEN_METEO_GEOCODING_URL, params=params)
                response.raise_for_status()
                data = response.json()
                results = data.get("results", [])
                
                parsed_results = []
                for item in results:
                    parsed_results.append(LocationItem(
                        id=item.get("id", 0),
                        name=item.get("name", ""),
                        latitude=item.get("latitude", 0.0),
                        longitude=item.get("longitude", 0.0),
                        elevation=item.get("elevation"),
                        feature_code=item.get("feature_code"),
                        country_code=item.get("country_code"),
                        country=item.get("country"),
                        admin1=item.get("admin1"),
                        admin2=item.get("admin2"),
                        timezone=item.get("timezone", "UTC"),
                        population=item.get("population")
                    ))
                
                # Cache raw dicts
                await cache_service.set(
                    cache_key, 
                    [item.model_dump() for item in parsed_results], 
                    settings.CACHE_TTL_GEOCODING
                )
                return parsed_results
        except httpx.HTTPError as e:
            logger.error(f"Geocoding API error: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error during geocoding search: {e}")
            return []


geocoding_service = GeocodingService()
