import httpx
import logging
from typing import Optional, Dict, Any
from app.core.config import settings
from app.schemas.weather import (
    WeatherForecastResponse,
    CurrentWeather,
    HourlyForecastItem,
    DailyForecastItem,
    interpret_weather_code,
)
from app.services.cache import cache_service

logger = logging.getLogger(__name__)


class WeatherService:
    async def get_forecast(self, latitude: float, longitude: float) -> Optional[WeatherForecastResponse]:
        # Round coords to 3 decimals for cache hit efficiency (approx ~100m precision)
        lat_rounded = round(latitude, 3)
        lon_rounded = round(longitude, 3)
        cache_key = f"weather:{lat_rounded}:{lon_rounded}"

        cached = await cache_service.get(cache_key)
        if cached:
            return WeatherForecastResponse(**cached)

        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": [
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "is_day",
                "precipitation",
                "weather_code",
                "pressure_msl",
                "wind_speed_10m",
                "wind_direction_10m"
            ],
            "hourly": [
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "precipitation_probability",
                "precipitation",
                "weather_code",
                "wind_speed_10m",
                "uv_index",
                "is_day",
                "visibility"
            ],
            "daily": [
                "weather_code",
                "temperature_2m_max",
                "temperature_2m_min",
                "apparent_temperature_max",
                "apparent_temperature_min",
                "sunrise",
                "sunset",
                "uv_index_max",
                "precipitation_sum",
                "precipitation_probability_max",
                "wind_speed_10m_max"
            ],
            "timezone": "auto",
            "forecast_days": 8
        }

        try:
            async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT) as client:
                response = await client.get(settings.OPEN_METEO_FORECAST_URL, params=params)
                response.raise_for_status()
                data = response.json()
                
                timezone_str = data.get("timezone", "UTC")
                timezone_abbr = data.get("timezone_abbreviation", "")
                elevation = data.get("elevation")

                # Parse Current Weather
                curr_raw = data.get("current", {})
                curr_code = curr_raw.get("weather_code", 0)
                is_day = curr_raw.get("is_day", 1)
                interpreted = interpret_weather_code(curr_code, is_day)

                # Find current visibility and uv from hourly array matching current time
                hourly_raw = data.get("hourly", {})
                hourly_times = hourly_raw.get("time", [])
                curr_time = curr_raw.get("time", "")
                
                curr_vis = 10000.0
                curr_uv = 0.0
                if curr_time in hourly_times:
                    idx = hourly_times.index(curr_time)
                    if "visibility" in hourly_raw and idx < len(hourly_raw["visibility"]):
                        curr_vis = hourly_raw["visibility"][idx] or 10000.0
                    if "uv_index" in hourly_raw and idx < len(hourly_raw["uv_index"]):
                        curr_uv = hourly_raw["uv_index"][idx] or 0.0
                elif len(hourly_times) > 0:
                    if "visibility" in hourly_raw and len(hourly_raw["visibility"]) > 0:
                        curr_vis = hourly_raw["visibility"][0] or 10000.0
                    if "uv_index" in hourly_raw and len(hourly_raw["uv_index"]) > 0:
                        curr_uv = hourly_raw["uv_index"][0] or 0.0

                current = CurrentWeather(
                    time=curr_time,
                    temperature=curr_raw.get("temperature_2m", 0.0),
                    apparent_temperature=curr_raw.get("apparent_temperature", 0.0),
                    relative_humidity=curr_raw.get("relative_humidity_2m", 0),
                    precipitation=curr_raw.get("precipitation", 0.0),
                    weather_code=curr_code,
                    weather_description=interpreted["description"],
                    weather_icon=interpreted["icon"],
                    weather_category=interpreted["category"],
                    is_day=is_day,
                    wind_speed=curr_raw.get("wind_speed_10m", 0.0),
                    wind_direction=curr_raw.get("wind_direction_10m", 0),
                    pressure_msl=curr_raw.get("pressure_msl", 1013.25),
                    uv_index=curr_uv,
                    visibility=curr_vis
                )

                # Parse Hourly Forecast: Take 24-36 hours starting from current time
                hourly_items: list[HourlyForecastItem] = []
                start_idx = 0
                if curr_time in hourly_times:
                    start_idx = hourly_times.index(curr_time)
                
                # Fetch next 24 hours
                end_idx = min(start_idx + 25, len(hourly_times))
                for i in range(start_idx, end_idx):
                    h_code = hourly_raw.get("weather_code", [0])[i] if i < len(hourly_raw.get("weather_code", [])) else 0
                    h_is_day = hourly_raw.get("is_day", [1])[i] if i < len(hourly_raw.get("is_day", [])) else 1
                    h_interp = interpret_weather_code(h_code, h_is_day)
                    
                    hourly_items.append(HourlyForecastItem(
                        time=hourly_times[i],
                        temperature=hourly_raw.get("temperature_2m", [0.0])[i],
                        apparent_temperature=hourly_raw.get("apparent_temperature", [0.0])[i],
                        precipitation_probability=hourly_raw.get("precipitation_probability", [0])[i] or 0,
                        precipitation=hourly_raw.get("precipitation", [0.0])[i] or 0.0,
                        weather_code=h_code,
                        weather_description=h_interp["description"],
                        weather_icon=h_interp["icon"],
                        is_day=h_is_day,
                        wind_speed=hourly_raw.get("wind_speed_10m", [0.0])[i],
                        uv_index=hourly_raw.get("uv_index", [0.0])[i] or 0.0,
                        humidity=hourly_raw.get("relative_humidity_2m", [0])[i] or 0,
                    ))

                # Parse Daily Forecast (7-8 days)
                daily_raw = data.get("daily", {})
                daily_dates = daily_raw.get("time", [])
                daily_items: list[DailyForecastItem] = []

                for i in range(len(daily_dates)):
                    d_code = daily_raw.get("weather_code", [0])[i] if i < len(daily_raw.get("weather_code", [])) else 0
                    d_interp = interpret_weather_code(d_code, 1)

                    daily_items.append(DailyForecastItem(
                        date=daily_dates[i],
                        weather_code=d_code,
                        weather_description=d_interp["description"],
                        weather_icon=d_interp["icon"],
                        weather_category=d_interp["category"],
                        temperature_max=daily_raw.get("temperature_2m_max", [0.0])[i],
                        temperature_min=daily_raw.get("temperature_2m_min", [0.0])[i],
                        apparent_temperature_max=daily_raw.get("apparent_temperature_max", [0.0])[i],
                        apparent_temperature_min=daily_raw.get("apparent_temperature_min", [0.0])[i],
                        sunrise=daily_raw.get("sunrise", [""])[i],
                        sunset=daily_raw.get("sunset", [""])[i],
                        uv_index_max=daily_raw.get("uv_index_max", [0.0])[i] or 0.0,
                        precipitation_sum=daily_raw.get("precipitation_sum", [0.0])[i] or 0.0,
                        precipitation_probability_max=daily_raw.get("precipitation_probability_max", [0])[i] or 0,
                        wind_speed_max=daily_raw.get("wind_speed_10m_max", [0.0])[i] or 0.0,
                    ))

                result = WeatherForecastResponse(
                    latitude=data.get("latitude", latitude),
                    longitude=data.get("longitude", longitude),
                    elevation=elevation,
                    timezone=timezone_str,
                    timezone_abbreviation=timezone_abbr,
                    current=current,
                    hourly=hourly_items,
                    daily=daily_items,
                )

                await cache_service.set(cache_key, result.model_dump(), settings.CACHE_TTL_WEATHER)
                return result

        except httpx.HTTPError as e:
            logger.error(f"Weather API HTTP error: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error in weather forecast: {e}")
            raise


weather_service = WeatherService()
