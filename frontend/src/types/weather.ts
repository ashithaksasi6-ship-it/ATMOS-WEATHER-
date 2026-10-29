export interface LocationItem {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code?: string;
  country?: string;
  admin1?: string;
  admin2?: string;
  timezone?: string;
  population?: number;
}

export interface CurrentWeather {
  time: string;
  temperature: number;
  apparent_temperature: number;
  relative_humidity: number;
  precipitation: number;
  weather_code: number;
  weather_description: string;
  weather_icon: string;
  weather_category: string;
  is_day: number;
  wind_speed: number;
  wind_direction: number;
  pressure_msl: number;
  uv_index: number;
  visibility: number;
}

export interface HourlyForecastItem {
  time: string;
  temperature: number;
  apparent_temperature: number;
  precipitation_probability: number;
  precipitation: number;
  weather_code: number;
  weather_description: string;
  weather_icon: string;
  is_day: number;
  wind_speed: number;
  uv_index: number;
  humidity: number;
}

export interface DailyForecastItem {
  date: string;
  weather_code: number;
  weather_description: string;
  weather_icon: string;
  weather_category: string;
  temperature_max: number;
  temperature_min: number;
  apparent_temperature_max: number;
  apparent_temperature_min: number;
  sunrise: string;
  sunset: string;
  uv_index_max: number;
  precipitation_sum: number;
  precipitation_probability_max: number;
  wind_speed_max: number;
}

export interface WeatherForecastResponse {
  latitude: number;
  longitude: number;
  elevation?: number;
  timezone: string;
  timezone_abbreviation?: string;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
}

export interface AirQualityResponse {
  latitude: number;
  longitude: number;
  european_aqi?: number;
  us_aqi?: number;
  aqi_description: string;
  aqi_color: string;
  pm2_5?: number;
  pm10?: number;
  carbon_monoxide?: number;
  nitrogen_dioxide?: number;
  sulphur_dioxide?: number;
  ozone?: number;
  dust?: number;
}

export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface AssistantChatRequest {
  question: string;
  city: string;
  weather_data?: WeatherForecastResponse;
  air_quality_data?: AirQualityResponse;
  conversation_history?: AssistantMessage[];
}

export interface AssistantChatResponse {
  answer: string;
  suggested_followups: string[];
}

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type SpeedUnit = 'kmh' | 'mph';
