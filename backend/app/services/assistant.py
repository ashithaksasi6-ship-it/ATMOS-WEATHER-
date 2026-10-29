import re
from datetime import date, datetime
import httpx
import logging
from typing import Optional, Dict, Any, List
from app.core.config import settings
from app.schemas.weather import AssistantChatRequest, AssistantChatResponse

logger = logging.getLogger(__name__)


def _format_day_name(date_str: str) -> str:
    """Format YYYY-MM-DD to e.g. 'Wednesday, Oct 29'."""
    if not date_str:
        return ""
    try:
        dt = date.fromisoformat(date_str)
        return dt.strftime("%A, %b %d")
    except Exception:
        return date_str


def _resolve_target_day(q: str, daily: List[Dict[str, Any]]) -> Optional[tuple[int, str, Dict[str, Any]]]:
    """
    Resolves the day mentioned in query (e.g., 'after 2 days', 'in 3 days', 'tomorrow', 'Saturday').
    Returns (index, label, day_dict) or None if no specific future or target day is identified.
    """
    if not daily:
        return None

    # Match "after N days", "in N days", "N days from now", "N days later", "N days after"
    match_days = re.search(r'(?:after|in)\s+(\d+)\s+days?|(\d+)\s+days?\s+(?:later|after|from now)', q)
    if match_days:
        num = int(match_days.group(1) or match_days.group(2))
        if 0 <= num < len(daily):
            d = daily[num]
            fmt = _format_day_name(d.get("date", ""))
            label = f"in {num} days ({fmt})" if fmt else f"in {num} days"
            return (num, label, d)
        return (num, f"in {num} days", {})

    # Match "day after tomorrow" or "after tomorrow"
    if "day after tomorrow" in q or "after tomorrow" in q:
        idx = 2
        if idx < len(daily):
            d = daily[idx]
            fmt = _format_day_name(d.get("date", ""))
            label = f"the day after tomorrow ({fmt})" if fmt else "the day after tomorrow"
            return (idx, label, d)
        return (idx, "the day after tomorrow", {})

    # Match "tomorrow"
    if "tomorrow" in q:
        idx = 1
        if idx < len(daily):
            d = daily[idx]
            fmt = _format_day_name(d.get("date", ""))
            label = f"tomorrow ({fmt})" if fmt else "tomorrow"
            return (idx, label, d)
        return (idx, "tomorrow", {})

    # Match weekday names
    weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    for w_idx, w_name in enumerate(weekdays):
        if w_name in q:
            for idx, d in enumerate(daily):
                d_date = d.get("date", "")
                if d_date:
                    try:
                        dt = date.fromisoformat(d_date)
                        if dt.weekday() == w_idx:
                            fmt = dt.strftime("%A, %b %d")
                            label = f"on {fmt}"
                            return (idx, label, d)
                    except Exception:
                        pass

    # Match "weekend"
    if "weekend" in q:
        for idx, d in enumerate(daily):
            d_date = d.get("date", "")
            if d_date:
                try:
                    dt = date.fromisoformat(d_date)
                    if dt.weekday() in (5, 6):  # Saturday or Sunday
                        fmt = dt.strftime("%A, %b %d")
                        label = f"this weekend ({fmt})"
                        return (idx, label, d)
                except Exception:
                    pass

    # Match "today" or "tonight"
    if any(w in q for w in ["today", "tonight", "right now", "currently"]):
        return (0, "today", daily[0] if len(daily) > 0 else {})

    return None


class AssistantProvider:
    """Interface for assistant providers."""
    async def generate_response(self, request: AssistantChatRequest) -> AssistantChatResponse:
        raise NotImplementedError


class RuleBasedWeatherAssistant(AssistantProvider):
    """
    Intelligent, grounded weather assistant answering questions based strictly
    on validated forecast and air-quality data for the selected location.
    Supports current conditions, 24-hour trends, and full 7-day outlook.
    """
    async def generate_response(self, request: AssistantChatRequest) -> AssistantChatResponse:
        q = request.question.lower().strip()
        city = request.city or "your location"
        weather = request.weather_data or {}
        aqi = request.air_quality_data or {}

        current = weather.get("current", {})
        daily = weather.get("daily", [])
        hourly = weather.get("hourly", [])

        # Default fallback suggested questions
        suggested = [
            "Will it rain today?",
            "What will be the weather after 2 days?",
            "How is the 7-day outlook?",
            "Is tomorrow good for outdoor activities?",
            "How is the air quality right now?"
        ]

        if not current and not daily and not aqi:
            return AssistantChatResponse(
                answer=f"I don't have weather data for {city} right now. Please select a city to get detailed weather insights!",
                suggested_followups=suggested
            )

        curr_temp = current.get("temperature", 0.0)
        curr_desc = current.get("weather_description", "Fair")
        feels_like = current.get("apparent_temperature", curr_temp)
        humidity = current.get("relative_humidity", 0)
        wind = current.get("wind_speed", 0.0)
        precip = current.get("precipitation", 0.0)

        today_daily = daily[0] if len(daily) > 0 else {}
        tomorrow_daily = daily[1] if len(daily) > 1 else {}

        # 1. Multi-Day / 7-Day Outlook query
        if any(w in q for w in ["7 days", "7-day", "seven days", "weekly", "week outlook", "forecast outlook", "next week", "upcoming week", "this week"]):
            if daily:
                max_t = max(d.get("temperature_max", -99) for d in daily)
                min_t = min(d.get("temperature_min", 99) for d in daily)
                rainy_days = [d for d in daily if d.get("precipitation_probability_max", 0) >= 50]
                conds = [d.get("weather_description", "") for d in daily[:7] if d.get("weather_description")]
                predominant = max(set(conds), key=conds.count) if conds else "fair"
                rain_summary = f"{len(rainy_days)} day(s) with higher chance of rain" if rainy_days else "minimal precipitation chances"

                answer = (
                    f"Here is the 7-day outlook for {city}: Temperatures range from lows around {min_t}°C to highs around {max_t}°C, "
                    f"with predominantly {predominant.lower()} conditions and {rain_summary}. "
                    f"You can ask me about any specific day (e.g. 'weather after 2 days' or 'weekend forecast') for detailed metrics!"
                )
            else:
                answer = f"I do not have the multi-day forecast loaded for {city} right now."
            return AssistantChatResponse(
                answer=answer,
                suggested_followups=["What will be the weather after 2 days?", "Will it rain today?", "How is the air quality?"]
            )

        # 2. Compare Tomorrow with Today
        if any(w in q for w in ["compare", "comparison", "difference", "tomorrow vs today", "warmer or colder"]):
            if today_daily and tomorrow_daily:
                t1_max = today_daily.get("temperature_max", 0)
                t2_max = tomorrow_daily.get("temperature_max", 0)
                diff = round(t2_max - t1_max, 1)
                pop1 = today_daily.get("precipitation_probability_max", 0)
                pop2 = tomorrow_daily.get("precipitation_probability_max", 0)
                
                temp_diff_str = f"about {abs(diff)}°C warmer" if diff > 0 else (f"about {abs(diff)}°C cooler" if diff < 0 else "roughly the same temperature")
                answer = (
                    f"Comparing today and tomorrow in {city}: Tomorrow will be {temp_diff_str} "
                    f"(high of {t2_max}°C compared to today's {t1_max}°C). "
                    f"Rain probability changes from {pop1}% today to {pop2}% tomorrow. "
                    f"Conditions: Today is {today_daily.get('weather_description', '')}, while tomorrow will be {tomorrow_daily.get('weather_description', '')}."
                )
            else:
                answer = f"I don't have enough forecast days loaded to compare tomorrow with today for {city}."
            return AssistantChatResponse(
                answer=answer,
                suggested_followups=["Will it rain tomorrow?", "Is tomorrow good for outdoor activities?", "Check UV index"]
            )

        # 3. Check for specific target day queries (e.g. after 2 days, day after tomorrow, tomorrow, weekday, weekend)
        target_info = _resolve_target_day(q, daily)
        if target_info:
            target_idx, target_label, target_day = target_info
            if not target_day or target_idx >= len(daily):
                return AssistantChatResponse(
                    answer=f"I only have forecast records for up to {len(daily)} days for {city}. Please ask about a day within the 7-day outlook.",
                    suggested_followups=suggested
                )

            # If user asks about a future day (index > 0)
            if target_idx > 0:
                t_max = target_day.get("temperature_max", 0.0)
                t_min = target_day.get("temperature_min", 0.0)
                pop = target_day.get("precipitation_probability_max", 0)
                cond = target_day.get("weather_description", "Fair")
                wind_max = target_day.get("wind_speed_max", 0.0)
                precip_sum = target_day.get("precipitation_sum", 0.0)
                uv_max = target_day.get("uv_index_max", 0.0)

                # Check if asking specifically about rain
                if any(w in q for w in ["rain", "umbrella", "precipitation", "shower", "wet"]):
                    if pop >= 60:
                        answer = (
                            f"High chance of rain ({pop}%, ~{precip_sum} mm) in {city} {target_label}. "
                            f"Forecasted conditions are {cond.lower()}, so carrying an umbrella or rain gear is strongly recommended!"
                        )
                    elif pop >= 30:
                        answer = (
                            f"Moderate chance of showers ({pop}%, ~{precip_sum} mm) in {city} {target_label} ({cond.lower()}). "
                            f"Carrying a compact umbrella would be a good idea."
                        )
                    else:
                        answer = (
                            f"Rain is unlikely in {city} {target_label}. "
                            f"Precipitation chance is only {pop}% ({precip_sum} mm) with {cond.lower()} conditions."
                        )
                    return AssistantChatResponse(
                        answer=answer,
                        suggested_followups=["How is the 7-day outlook?", "Will it rain today?", "Check air quality"]
                    )

                # Check if asking about outdoor activities
                if any(w in q for w in ["outdoor", "run", "hiking", "picnic", "suitable", "go out", "sports"]):
                    conditions_good = (pop < 40) and (t_max <= 34) and (wind_max < 30)
                    if conditions_good:
                        answer = (
                            f"Yes! {target_label.capitalize()} looks great for outdoor activities in {city}. "
                            f"Expect {cond.lower()} conditions with comfortable temperatures between {t_min}°C and {t_max}°C, and only a {pop}% chance of rain."
                        )
                    else:
                        reasons = []
                        if pop >= 40:
                            reasons.append(f"a {pop}% chance of rain")
                        if t_max > 34:
                            reasons.append(f"temperatures reaching {t_max}°C")
                        if wind_max >= 30:
                            reasons.append(f"winds up to {wind_max} km/h")
                        reasons_str = " and ".join(reasons)
                        answer = (
                            f"{target_label.capitalize()} might be challenging for outdoor plans in {city} due to {reasons_str}. "
                            f"The expected forecast is {cond.lower()} ({t_min}°C – {t_max}°C)."
                        )
                    return AssistantChatResponse(
                        answer=answer,
                        suggested_followups=["Will it rain?", "How is the 7-day outlook?", "Check air quality"]
                    )

                # General weather forecast for that day
                answer = (
                    f"Forecast for {city} {target_label}: Expect {cond.lower()} with a high of {t_max}°C and a low of {t_min}°C. "
                    f"Precipitation probability is {pop}% ({precip_sum} mm) with maximum wind speeds around {wind_max} km/h and peak UV index of {uv_max}."
                )
                return AssistantChatResponse(
                    answer=answer,
                    suggested_followups=["Will it rain today?", "How is the 7-day outlook?", "How is the air quality right now?"]
                )

        # 4. Rain / Umbrella Questions (Today / Current)
        if any(w in q for w in ["rain", "umbrella", "precipitation", "shower", "wet"]):
            today_pop = today_daily.get("precipitation_probability_max", 0)
            today_sum = today_daily.get("precipitation_sum", 0.0)

            # Check next 12 hours rain probability
            next_hours_rain = [
                h.get("precipitation_probability", 0) for h in hourly[:12]
            ]
            max_next_pop = max(next_hours_rain) if next_hours_rain else today_pop

            if precip > 0 or "rain" in curr_desc.lower():
                answer = (
                    f"Yes, it is currently raining in {city} with an intensity of {precip} mm. "
                    f"You definitely should carry an umbrella or a waterproof coat today!"
                )
            elif max_next_pop >= 60:
                answer = (
                    f"High chance of rain today in {city}! The peak precipitation probability reaches {max_next_pop}%. "
                    f"Definitely keep an umbrella handy."
                )
            elif max_next_pop >= 30:
                answer = (
                    f"There is a moderate chance ({max_next_pop}%) of light showers today in {city}. "
                    f"Having a compact umbrella with you would be a smart precaution."
                )
            else:
                answer = (
                    f"Rain is unlikely today in {city}. The precipitation chance is only {max_next_pop}% with {today_sum} mm expected. "
                    f"You can safely leave the umbrella at home!"
                )
            return AssistantChatResponse(
                answer=answer,
                suggested_followups=["What will be the weather after 2 days?", "Is tomorrow good for outdoor activities?", "How is the air quality?"]
            )

        # 5. Outdoor Activities / Today suitable
        if any(w in q for w in ["outdoor", "run", "hiking", "picnic", "suitable", "go out", "sports"]):
            t_max = today_daily.get("temperature_max", 25.0)
            t_min = today_daily.get("temperature_min", 18.0)
            pop = today_daily.get("precipitation_probability_max", 0)
            cond = today_daily.get("weather_description", "Fair")
            wind_max = today_daily.get("wind_speed_max", 10.0)

            conditions_good = (pop < 40) and (t_max <= 34) and (wind_max < 30)

            if conditions_good:
                answer = (
                    f"Yes! Today looks great for outdoor activities in {city}. Expect {cond.lower()} conditions "
                    f"with comfortable temperatures ranging between {t_min}°C and {t_max}°C, with only a {pop}% chance of rain."
                )
            else:
                reasons = []
                if pop >= 40:
                    reasons.append(f"a {pop}% chance of rain")
                if t_max > 34:
                    reasons.append(f"high heat reaching {t_max}°C")
                if wind_max >= 30:
                    reasons.append(f"strong wind gusts up to {wind_max} km/h")
                reasons_str = " and ".join(reasons)
                answer = (
                    f"Today might be challenging for outdoor activities in {city} due to {reasons_str}. "
                    f"The overall forecast is {cond.lower()} ({t_min}°C – {t_max}°C). If you head out, plan indoor backups."
                )
            return AssistantChatResponse(
                answer=answer,
                suggested_followups=["Will it rain?", "What will be the weather after 2 days?", "Check air quality"]
            )

        # 6. Tonight temperature
        if any(w in q for w in ["tonight", "night", "temperature tonight", "overnight"]):
            night_temps = []
            for h in hourly:
                time_str = h.get("time", "")
                if "T" in time_str:
                    hour_num = int(time_str.split("T")[1].split(":")[0])
                    if hour_num >= 20 or hour_num <= 5:
                        night_temps.append(h.get("temperature"))
            
            min_temp = min(night_temps) if night_temps else today_daily.get("temperature_min", curr_temp)
            answer = (
                f"Tonight in {city}, temperatures will cool down to around {min_temp}°C. "
                f"Conditions are expected to remain {curr_desc.lower()} with humidity around {humidity}%."
            )
            return AssistantChatResponse(
                answer=answer,
                suggested_followups=["Will it rain tomorrow?", "How is the air quality?", "What will be the weather after 2 days?"]
            )

        # 7. Air Quality
        if any(w in q for w in ["air", "aqi", "pollution", "smog", "breathe", "pm2.5", "pm10"]):
            if aqi:
                desc = aqi.get("aqi_description", "Moderate")
                eu_aqi = aqi.get("european_aqi", "N/A")
                pm25 = aqi.get("pm2_5", "N/A")
                pm10 = aqi.get("pm10", "N/A")
                answer = (
                    f"Air quality in {city} is rated as **{desc}** (European AQI: {eu_aqi}). "
                    f"Particulate matter levels are PM2.5: {pm25} µg/m³ and PM10: {pm10} µg/m³. "
                    f"{'Air quality is ideal for most outdoor individuals.' if desc in ['Good', 'Fair'] else 'Sensitive groups should consider limiting prolonged outdoor exertion.'}"
                )
            else:
                answer = f"Air quality data is currently unavailable for {city}."
            return AssistantChatResponse(
                answer=answer,
                suggested_followups=["Will it rain today?", "What will be the weather after 2 days?", "How is the 7-day outlook?"]
            )

        # 8. Temperature / Weather summary general
        if any(w in q for w in ["temperature", "temp", "hot", "cold", "weather", "forecast", "how is it"]):
            t_max = today_daily.get("temperature_max", curr_temp)
            t_min = today_daily.get("temperature_min", curr_temp)
            answer = (
                f"Currently in {city}, it is {curr_temp}°C (feels like {feels_like}°C) with {curr_desc.lower()}. "
                f"Today's high is expected at {t_max}°C and low at {t_min}°C, with wind speeds at {wind} km/h and humidity at {humidity}%."
            )
            return AssistantChatResponse(
                answer=answer,
                suggested_followups=["Will it rain today?", "What will be the weather after 2 days?", "How is the 7-day outlook?"]
            )

        # Default general response
        answer = (
            f"In {city}, the weather is currently {curr_desc.lower()} at {curr_temp}°C (feels like {feels_like}°C). "
            f"Today's high is {today_daily.get('temperature_max', curr_temp)}°C with a {today_daily.get('precipitation_probability_max', 0)}% chance of rain. "
            f"Feel free to ask me about rain chances, what to expect after 2 days, or the 7-day outlook!"
        )
        return AssistantChatResponse(
            answer=answer,
            suggested_followups=suggested
        )


class GroqWeatherAssistant(AssistantProvider):
    """
    High-speed LLM assistant powered by Groq (Llama-3.3-70b / Qwen).
    Injects verified real forecast & AQI context (current conditions + full 7-day outlook)
    into prompt with strict anti-hallucination constraints.
    Falls back gracefully to RuleBasedWeatherAssistant on failure.
    """
    def __init__(self, fallback: AssistantProvider):
        self.fallback = fallback

    async def generate_response(self, request: AssistantChatRequest) -> AssistantChatResponse:
        if not settings.GROQ_API_KEY:
            return await self.fallback.generate_response(request)

        city = request.city or "the selected location"
        weather = request.weather_data or {}
        aqi = request.air_quality_data or {}
        current = weather.get("current", {})
        daily = weather.get("daily", [])

        # Formulate grounded context
        context_str = (
            f"Location: {city}\n"
            f"Current Conditions: {current.get('weather_description', 'N/A')}, "
            f"Temperature: {current.get('temperature', 'N/A')}°C, "
            f"Feels Like: {current.get('apparent_temperature', 'N/A')}°C, "
            f"Humidity: {current.get('relative_humidity', 'N/A')}%, "
            f"Precipitation: {current.get('precipitation', 0)} mm, "
            f"Wind: {current.get('wind_speed', 'N/A')} km/h.\n"
        )

        if daily:
            context_str += "Daily Forecast Outlook (Up to 7-8 Days):\n"
            for idx, d in enumerate(daily):
                date_str = d.get("date", "")
                day_fmt = _format_day_name(date_str)
                if idx == 0:
                    label = f"Day 0 - Today ({day_fmt})" if day_fmt else "Day 0 - Today"
                elif idx == 1:
                    label = f"Day 1 - Tomorrow ({day_fmt})" if day_fmt else "Day 1 - Tomorrow"
                elif idx == 2:
                    label = f"Day 2 - After 2 days / Day after tomorrow ({day_fmt})" if day_fmt else "Day 2 - Day after tomorrow"
                else:
                    label = f"Day {idx} - In {idx} days ({day_fmt})" if day_fmt else f"Day {idx}"

                desc = d.get("weather_description", "Fair")
                t_max = d.get("temperature_max", "N/A")
                t_min = d.get("temperature_min", "N/A")
                pop = d.get("precipitation_probability_max", 0)
                precip_sum = d.get("precipitation_sum", 0)
                wind_max = d.get("wind_speed_max", "N/A")
                uv_max = d.get("uv_index_max", "N/A")

                context_str += (
                    f"  * {label}: {desc}, High: {t_max}°C, Low: {t_min}°C, "
                    f"Rain Chance: {pop}%, Precipitation: {precip_sum} mm, Max Wind: {wind_max} km/h, UV: {uv_max}.\n"
                )

        if aqi:
            context_str += (
                f"Air Quality: {aqi.get('aqi_description')} (European AQI: {aqi.get('european_aqi')}), "
                f"PM2.5: {aqi.get('pm2_5')} µg/m³, PM10: {aqi.get('pm10')} µg/m³.\n"
            )

        system_prompt = (
            "You are Atmos AI, a friendly, concise meteorologist assistant. "
            "You must answer strictly using the provided real weather and air quality data. "
            "You have access to current conditions, air quality, and the full multi-day forecast (including tomorrow, after 2 days / day after tomorrow, and subsequent days up to 7-8 days). "
            "Never invent measurements, rain chances, or temperature values. "
            "When users ask about future days (such as tomorrow, after 2 days / the day after tomorrow, in 3 days, this weekend, or the 7-day outlook), reference the matching daily forecast entry accurately. "
            "Keep answers engaging, helpful, and concise (under 4 sentences unless a multi-day comparison or full weekly summary is asked)."
            f"\n\nContext Data:\n{context_str}"
        )

        messages = [{"role": "system", "content": system_prompt}]
        if request.conversation_history:
            for m in request.conversation_history[-4:]:
                messages.append({"role": m.role, "content": m.content})
        messages.append({"role": "user", "content": request.question})

        headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "Atmos-Weather-App/1.0"
        }
        payload = {
            "model": settings.GROQ_MODEL,
            "messages": messages,
            "temperature": 0.4,
            "max_tokens": 350
        }

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
                res.raise_for_status()
                data = res.json()
                answer = data["choices"][0]["message"]["content"].strip()
                
                followups = [
                    "Will it rain today?",
                    "What will be the weather after 2 days?",
                    "How is the 7-day outlook?",
                    "Is tomorrow good for outdoor activities?",
                    "How is the air quality right now?"
                ]
                return AssistantChatResponse(answer=answer, suggested_followups=followups)
        except Exception as e:
            logger.warning(f"Groq API call failed or timed out ({e}). Falling back to rule-based engine.")
            return await self.fallback.generate_response(request)


# Instantiate with fallback capability
rule_assistant = RuleBasedWeatherAssistant()
weather_assistant_service = GroqWeatherAssistant(fallback=rule_assistant)
