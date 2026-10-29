import {
  LocationItem,
  WeatherForecastResponse,
  AirQualityResponse,
  AssistantChatRequest,
  AssistantChatResponse,
} from '@/types/weather';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class WeatherApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async searchLocations(query: string, count: number = 8): Promise<LocationItem[]> {
    if (!query || query.trim().length < 2) return [];
    const url = `${this.baseUrl}/api/locations/search?q=${encodeURIComponent(query.trim())}&count=${count}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      throw new Error(`Failed to search locations: ${res.statusText}`);
    }
    return res.json();
  }

  async getForecast(latitude: number, longitude: number): Promise<WeatherForecastResponse> {
    const url = `${this.baseUrl}/api/weather/forecast?latitude=${latitude}&longitude=${longitude}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      throw new Error(`Failed to fetch forecast: ${res.statusText}`);
    }
    return res.json();
  }

  async getAirQuality(latitude: number, longitude: number): Promise<AirQualityResponse> {
    const url = `${this.baseUrl}/api/air-quality?latitude=${latitude}&longitude=${longitude}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      throw new Error(`Failed to fetch air quality: ${res.statusText}`);
    }
    return res.json();
  }

  async askAssistant(request: AssistantChatRequest): Promise<AssistantChatResponse> {
    const url = `${this.baseUrl}/api/assistant/chat`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      throw new Error(`Failed to communicate with assistant: ${res.statusText}`);
    }
    return res.json();
  }
}

export const weatherApi = new WeatherApiClient();
