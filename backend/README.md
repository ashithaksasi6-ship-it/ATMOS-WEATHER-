<p align="center">
  <img src="../frontend/logo/image.png" alt="Atmos Engine Logo" width="100" style="border-radius: 20px;" />
</p>

<h1 align="center">Atmos Weather Engine — Backend API</h1>

<p align="center">
  <strong>FastAPI • Pydantic v2 • Async HTTPX • Open-Meteo • Groq AI</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Pydantic-v2-E92063?style=for-the-badge&logo=pydantic&logoColor=white" alt="Pydantic v2" />
  <img src="https://img.shields.io/badge/Pytest-Passing-brightgreen?style=for-the-badge&logo=pytest&logoColor=white" alt="Pytest" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT License" />
</p>

---

## Overview

The **Atmos Weather Engine** is a high-performance, asynchronous RESTful API service built with Python 3.11 and FastAPI. It interfaces with **Open-Meteo APIs** to provide real-time weather observations, 24-hour hourly trend analytics, 7-day multi-day forecasts, European Air Quality Index (AQI) ratings, and a grounded AI weather assistant powered by **Groq** with an intelligent rule-based fallback.

---

## Architecture & Key Features

- **Hyperlocal Forecast Service**: Ingests temperature, feels-like, humidity, precipitation probabilities, wind speed/direction, UV index, and atmospheric pressure.
- **7-Day Outlook Modeling**: Calculates daily highs, lows, solar cycle (sunrise / sunset), max UV index, wind gusts, and precipitation sums.
- **Air Quality Analysis**: Categorizes European AQI (`Good`, `Fair`, `Moderate`, `Poor`, `Very Poor`) alongside particulate metrics (PM2.5, PM10, $\text{NO}_2$, $\text{O}_3$).
- **Smart AI Assistant**: 
  - Grounded context injection feeding 7-day forecast data to **Groq LLM** (`qwen/qwen3.8-27b` / Llama 3.3).
  - Anti-hallucination constraints ensuring answers strictly adhere to verified forecast data.
  - Built-in rule-based fallback handling natural queries (e.g., *"weather after 2 days"*, *"7-day outlook"*, *"will it rain this weekend"*).
- **Thread-Safe In-Memory TTL Cache**: Reduces upstream latency and avoids rate limits by caching weather forecasts for 10 minutes, geocoding for 24 hours, and air quality data for 30 minutes.

---

## Directory Layout

```
backend/
├── app/
│   ├── api/
│   │   └── routes.py           # REST endpoints definition
│   ├── core/
│   │   └── config.py           # Pydantic Settings configuration
│   ├── schemas/
│   │   └── weather.py          # Pydantic v2 models & WMO weather code mapping
│   ├── services/
│   │   ├── air_quality.py      # Open-Meteo Air Quality service
│   │   ├── assistant.py        # Groq + Rule-based weather assistant
│   │   ├── cache.py            # Thread-safe in-memory TTL caching layer
│   │   ├── geocoding.py        # City search & location lookup
│   │   └── weather.py          # Forecast processing & code interpretation
│   └── main.py                 # FastAPI application root & CORS middleware
├── tests/
│   └── test_weather.py         # Pytest suite for code mapping, cache, & assistant
├── .env.example                # Template configuration file
├── Dockerfile                  # Container definition for production deployment
├── requirements.txt            # Python dependencies
└── README.md                   # Backend documentation
```

---

## API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status verification |
| `GET` | `/api/locations/search?q={query}&count=8` | Autocomplete geocoding search |
| `GET` | `/api/weather/forecast?latitude={lat}&longitude={lon}` | Current, 24h hourly, and 8-day daily forecast |
| `GET` | `/api/air-quality?latitude={lat}&longitude={lon}` | European and US AQI with pollutant details |
| `POST` | `/api/assistant/chat` | Contextual AI assistant query endpoint |

### Example Assistant Chat Request
```json
POST /api/assistant/chat
Content-Type: application/json

{
  "question": "What will be the weather after 2 days?",
  "city": "Tokyo",
  "weather_data": { ... },
  "air_quality_data": { ... },
  "conversation_history": []
}
```

---

## Local Development

### 1. Prerequisites
- Python 3.11+
- `pip` package manager

### 2. Environment Configuration
Create a `.env` file from the provided template:

```bash
cp .env.example .env
```

Edit `.env` to configure your settings (optional Groq API key for AI assistant):
```ini
PROJECT_NAME="Atmos Weather API"
DEBUG=False
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000","https://your-vercel-domain.vercel.app"]

# Groq AI Assistant (Free key from https://console.groq.com/keys)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=qwen/qwen3.8-27b
```

### 3. Installation & Server Start
```bash
# Optional: create virtual environment
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server with live reload
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- API Base: `http://localhost:8000`
- Interactive Swagger UI: `http://localhost:8000/docs`
- ReDoc Docs: `http://localhost:8000/redoc`

---

## Running Automated Tests

Run unit tests covering weather code interpretation, TTL cache expiration, and grounded assistant responses:

```bash
python -m pytest tests/ -o pythonpath=.
```

---

## Deployment Options

### Option A: Railway
1. Create a new project on [Railway.app](https://railway.app/).
2. Connect your GitHub repository and select the `backend` directory.
3. Add environment variables from `.env.example`.
4. Railway will automatically detect the `Dockerfile` or run `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.

### Option B: Render
1. Create a **Web Service** on [Render.com](https://render.com/).
2. Set **Root Directory** to `backend`.
3. Set **Build Command** to `pip install -r requirements.txt`.
4. Set **Start Command** to `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
5. Add `GROQ_API_KEY` and `CORS_ORIGINS` under Environment Variables.

### Option C: Docker
```bash
docker build -t atmos-backend:latest .
docker run -p 8000:8000 --env-file .env atmos-backend:latest
```

