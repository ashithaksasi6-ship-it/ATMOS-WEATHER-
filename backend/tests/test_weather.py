import pytest
from app.schemas.weather import interpret_weather_code, WEATHER_CODE_MAP
from app.services.assistant import weather_assistant_service
from app.schemas.weather import AssistantChatRequest
from app.services.cache import InMemoryTTLCache
import asyncio


def test_weather_code_interpretation():
    # 0 = Clear sky
    res_day = interpret_weather_code(0, is_day=1)
    assert res_day["description"] == "Clear sky"
    assert res_day["icon"] == "clear-day"
    assert res_day["category"] == "clear"

    res_night = interpret_weather_code(0, is_day=0)
    assert res_night["icon"] == "clear-night"

    # 61 = Slight rain
    res_rain = interpret_weather_code(61, is_day=1)
    assert "rain" in res_rain["description"].lower()
    assert res_rain["category"] == "rain"

    # Unknown code
    res_unknown = interpret_weather_code(9999, is_day=1)
    assert res_unknown["description"] == "Unknown"


@pytest.mark.asyncio
async def test_in_memory_cache():
    cache = InMemoryTTLCache()
    await cache.set("test_key", {"val": 123}, ttl_seconds=1)
    
    val = await cache.get("test_key")
    assert val == {"val": 123}

    # Test expiration
    await asyncio.sleep(1.1)
    val_expired = await cache.get("test_key")
    assert val_expired is None


@pytest.mark.asyncio
async def test_assistant_rain_grounded_answer():
    mock_weather = {
        "current": {
            "temperature": 28.5,
            "apparent_temperature": 32.0,
            "relative_humidity": 80,
            "precipitation": 2.5,
            "weather_description": "Moderate rain",
        },
        "daily": [
            {
                "precipitation_probability_max": 90,
                "precipitation_sum": 15.0,
                "weather_description": "Moderate rain"
            }
        ],
        "hourly": []
    }

    req = AssistantChatRequest(
        question="Will it rain today?",
        city="Kochi",
        weather_data=mock_weather
    )

    resp = await weather_assistant_service.generate_response(req)
    assert "raining" in resp.answer.lower() or "umbrella" in resp.answer.lower()
    assert len(resp.suggested_followups) > 0


@pytest.mark.asyncio
async def test_assistant_air_quality_answer():
    mock_aqi = {
        "european_aqi": 25,
        "aqi_description": "Fair",
        "pm2_5": 14.2,
        "pm10": 22.0
    }

    req = AssistantChatRequest(
        question="How is the air quality?",
        city="Munich",
        air_quality_data=mock_aqi
    )

    resp = await weather_assistant_service.generate_response(req)
    assert "fair" in resp.answer.lower()
    assert "14.2" in resp.answer


@pytest.mark.asyncio
async def test_assistant_after_2_days_forecast():
    from app.services.assistant import rule_assistant
    mock_weather = {
        "current": {
            "temperature": 29.0,
            "apparent_temperature": 32.0,
            "weather_description": "Partly cloudy",
        },
        "daily": [
            {
                "date": "2026-10-29",
                "temperature_max": 31.0,
                "temperature_min": 24.0,
                "precipitation_probability_max": 20,
                "precipitation_sum": 0.0,
                "weather_description": "Partly cloudy",
                "wind_speed_max": 12.0,
                "uv_index_max": 7.0,
            },
            {
                "date": "2026-10-30",
                "temperature_max": 30.0,
                "temperature_min": 23.0,
                "precipitation_probability_max": 40,
                "precipitation_sum": 1.2,
                "weather_description": "Moderate rain",
                "wind_speed_max": 15.0,
                "uv_index_max": 6.0,
            },
            {
                "date": "2026-10-31",
                "temperature_max": 27.5,
                "temperature_min": 22.0,
                "precipitation_probability_max": 85,
                "precipitation_sum": 18.5,
                "weather_description": "Thunderstorm",
                "wind_speed_max": 28.0,
                "uv_index_max": 4.5,
            },
        ],
        "hourly": []
    }

    req = AssistantChatRequest(
        question="what will be the weather after 2 days?",
        city="Kochi",
        weather_data=mock_weather
    )

    resp = await rule_assistant.generate_response(req)
    ans = resp.answer.lower()
    assert "thunderstorm" in ans
    assert "27.5" in ans
    assert "85" in ans


@pytest.mark.asyncio
async def test_assistant_7_day_outlook_query():
    from app.services.assistant import rule_assistant
    mock_weather = {
        "current": {"temperature": 25.0, "weather_description": "Clear"},
        "daily": [
            {"date": f"2026-10-{i:02d}", "temperature_max": 30.0, "temperature_min": 20.0, "precipitation_probability_max": 10, "weather_description": "Clear sky"}
            for i in range(29, 36)
        ],
        "hourly": []
    }

    req = AssistantChatRequest(
        question="How is the 7-day outlook?",
        city="Tokyo",
        weather_data=mock_weather
    )

    resp = await rule_assistant.generate_response(req)
    ans = resp.answer.lower()
    assert "7-day outlook" in ans
    assert "tokyo" in ans
    assert "30" in ans
