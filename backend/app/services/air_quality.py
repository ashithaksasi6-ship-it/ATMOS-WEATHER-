import httpx
import logging
from typing import Optional
from app.core.config import settings
from app.schemas.weather import AirQualityResponse
from app.services.cache import cache_service

logger = logging.getLogger(__name__)


def interpret_european_aqi(aqi: Optional[int]) -> tuple[str, str]:
    if aqi is None:
        return ("Unknown", "#94a3b8")
    if aqi <= 20:
        return ("Good", "#10b981")  # Emerald green
    elif aqi <= 40:
        return ("Fair", "#84cc16")  # Lime green
    elif aqi <= 60:
        return ("Moderate", "#f59e0b")  # Amber
    elif aqi <= 80:
        return ("Poor", "#f97316")  # Orange
    elif aqi <= 100:
        return ("Very Poor", "#ef4444")  # Red
    else:
        return ("Extremely Poor", "#7f1d1d")  # Dark red/purple


class AirQualityService:
    async def get_air_quality(self, latitude: float, longitude: float) -> Optional[AirQualityResponse]:
        lat_rounded = round(latitude, 3)
        lon_rounded = round(longitude, 3)
        cache_key = f"air_quality:{lat_rounded}:{lon_rounded}"

        cached = await cache_service.get(cache_key)
        if cached:
            return AirQualityResponse(**cached)

        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": [
                "european_aqi",
                "us_aqi",
                "pm10",
                "pm2_5",
                "carbon_monoxide",
                "nitrogen_dioxide",
                "sulphur_dioxide",
                "ozone",
                "dust"
            ],
            "timezone": "auto"
        }

        try:
            async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT) as client:
                response = await client.get(settings.OPEN_METEO_AIR_QUALITY_URL, params=params)
                response.raise_for_status()
                data = response.json()
                
                curr = data.get("current", {})
                eu_aqi = curr.get("european_aqi")
                us_aqi = curr.get("us_aqi")
                
                desc, color = interpret_european_aqi(eu_aqi)

                result = AirQualityResponse(
                    latitude=data.get("latitude", latitude),
                    longitude=data.get("longitude", longitude),
                    european_aqi=eu_aqi,
                    us_aqi=us_aqi,
                    aqi_description=desc,
                    aqi_color=color,
                    pm2_5=curr.get("pm2_5"),
                    pm10=curr.get("pm10"),
                    carbon_monoxide=curr.get("carbon_monoxide"),
                    nitrogen_dioxide=curr.get("nitrogen_dioxide"),
                    sulphur_dioxide=curr.get("sulphur_dioxide"),
                    ozone=curr.get("ozone"),
                    dust=curr.get("dust"),
                )

                await cache_service.set(cache_key, result.model_dump(), settings.CACHE_TTL_AIR_QUALITY)
                return result

        except httpx.HTTPError as e:
            logger.error(f"Air Quality API error: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error in air quality: {e}")
            raise


air_quality_service = AirQualityService()
