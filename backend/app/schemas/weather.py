from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


# --- Geocoding Schemas ---
class LocationItem(BaseModel):
    id: int
    name: str
    latitude: float
    longitude: float
    elevation: Optional[float] = None
    feature_code: Optional[str] = None
    country_code: Optional[str] = None
    country: Optional[str] = None
    admin1: Optional[str] = None  # State / Province
    admin2: Optional[str] = None
    timezone: Optional[str] = None
    population: Optional[int] = None


class LocationSearchResponse(BaseModel):
    results: List[LocationItem] = []


# --- Weather Code Mapping ---
# WMO Weather interpretation codes (WW)
WEATHER_CODE_MAP: Dict[int, Dict[str, str]] = {
    0: {"description": "Clear sky", "icon": "clear-day", "category": "clear"},
    1: {"description": "Mainly clear", "icon": "mainly-clear", "category": "clear"},
    2: {"description": "Partly cloudy", "icon": "partly-cloudy-day", "category": "cloudy"},
    3: {"description": "Overcast", "icon": "overcast", "category": "cloudy"},
    45: {"description": "Foggy", "icon": "fog", "category": "fog"},
    48: {"description": "Depositing rime fog", "icon": "fog", "category": "fog"},
    51: {"description": "Light drizzle", "icon": "drizzle", "category": "rain"},
    53: {"description": "Moderate drizzle", "icon": "drizzle", "category": "rain"},
    55: {"description": "Dense drizzle", "icon": "drizzle", "category": "rain"},
    56: {"description": "Light freezing drizzle", "icon": "sleet", "category": "snow"},
    57: {"description": "Dense freezing drizzle", "icon": "sleet", "category": "snow"},
    61: {"description": "Slight rain", "icon": "rain", "category": "rain"},
    63: {"description": "Moderate rain", "icon": "rain", "category": "rain"},
    65: {"description": "Heavy rain", "icon": "heavy-rain", "category": "rain"},
    66: {"description": "Light freezing rain", "icon": "freezing-rain", "category": "snow"},
    67: {"description": "Heavy freezing rain", "icon": "freezing-rain", "category": "snow"},
    71: {"description": "Slight snowfall", "icon": "snow", "category": "snow"},
    73: {"description": "Moderate snowfall", "icon": "snow", "category": "snow"},
    75: {"description": "Heavy snowfall", "icon": "heavy-snow", "category": "snow"},
    77: {"description": "Snow grains", "icon": "snow", "category": "snow"},
    80: {"description": "Slight rain showers", "icon": "rain-showers", "category": "rain"},
    81: {"description": "Moderate rain showers", "icon": "rain-showers", "category": "rain"},
    82: {"description": "Violent rain showers", "icon": "heavy-rain", "category": "rain"},
    85: {"description": "Slight snow showers", "icon": "snow-showers", "category": "snow"},
    86: {"description": "Heavy snow showers", "icon": "heavy-snow", "category": "snow"},
    95: {"description": "Thunderstorm", "icon": "thunderstorm", "category": "storm"},
    96: {"description": "Thunderstorm with slight hail", "icon": "thunderstorm-hail", "category": "storm"},
    99: {"description": "Thunderstorm with heavy hail", "icon": "thunderstorm-hail", "category": "storm"},
}


def interpret_weather_code(code: int, is_day: int = 1) -> Dict[str, str]:
    data = WEATHER_CODE_MAP.get(code, {"description": "Unknown", "icon": "cloud", "category": "cloudy"})
    icon = data["icon"]
    if is_day == 0:
        if icon == "clear-day":
            icon = "clear-night"
        elif icon == "partly-cloudy-day":
            icon = "partly-cloudy-night"
    return {
        "description": data["description"],
        "icon": icon,
        "category": data["category"],
    }


# --- Current Weather Schemas ---
class CurrentWeather(BaseModel):
    time: str
    temperature: float
    apparent_temperature: float
    relative_humidity: int
    precipitation: float
    weather_code: int
    weather_description: str
    weather_icon: str
    weather_category: str
    is_day: int
    wind_speed: float
    wind_direction: int
    pressure_msl: float
    uv_index: float
    visibility: float  # in meters or km


# --- Hourly Forecast Item ---
class HourlyForecastItem(BaseModel):
    time: str
    temperature: float
    apparent_temperature: float
    precipitation_probability: int
    precipitation: float
    weather_code: int
    weather_description: str
    weather_icon: str
    is_day: int
    wind_speed: float
    uv_index: float
    humidity: int


# --- Daily Forecast Item ---
class DailyForecastItem(BaseModel):
    date: str
    weather_code: int
    weather_description: str
    weather_icon: str
    weather_category: str
    temperature_max: float
    temperature_min: float
    apparent_temperature_max: float
    apparent_temperature_min: float
    sunrise: str
    sunset: str
    uv_index_max: float
    precipitation_sum: float
    precipitation_probability_max: int
    wind_speed_max: float


# --- Full Forecast Response ---
class WeatherForecastResponse(BaseModel):
    latitude: float
    longitude: float
    elevation: Optional[float] = None
    timezone: str
    timezone_abbreviation: Optional[str] = None
    current: CurrentWeather
    hourly: List[HourlyForecastItem]
    daily: List[DailyForecastItem]


# --- Air Quality Schemas ---
class PollutantDetail(BaseModel):
    value: float
    unit: str
    status: str  # e.g., Good, Moderate, Poor, Unhealthy


class AirQualityResponse(BaseModel):
    latitude: float
    longitude: float
    european_aqi: Optional[int] = None
    us_aqi: Optional[int] = None
    aqi_description: str
    aqi_color: str
    pm2_5: Optional[float] = None
    pm10: Optional[float] = None
    carbon_monoxide: Optional[float] = None
    nitrogen_dioxide: Optional[float] = None
    sulphur_dioxide: Optional[float] = None
    ozone: Optional[float] = None
    dust: Optional[float] = None


# --- Assistant Chat Schemas ---
class AssistantMessage(BaseModel):
    role: str  # 'user' | 'assistant'
    content: str


class AssistantChatRequest(BaseModel):
    question: str
    city: str
    weather_data: Optional[Dict[str, Any]] = None
    air_quality_data: Optional[Dict[str, Any]] = None
    conversation_history: Optional[List[AssistantMessage]] = None


class AssistantChatResponse(BaseModel):
    answer: str
    suggested_followups: List[str] = []
