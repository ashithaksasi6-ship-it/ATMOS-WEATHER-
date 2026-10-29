'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { WeatherHeader } from '@/components/WeatherHeader';
import { CurrentWeatherHero } from '@/components/CurrentWeatherHero';
import { HourlyForecast } from '@/components/HourlyForecast';
import { WeeklyForecast } from '@/components/WeeklyForecast';
import { WeatherMetrics } from '@/components/WeatherMetrics';
import { AirQualityCard } from '@/components/AirQualityCard';
import { WeatherAssistant } from '@/components/WeatherAssistant';
import { WeatherBackground } from '@/components/WeatherBackground';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { weatherApi } from '@/services/api';
import {
  WeatherForecastResponse,
  AirQualityResponse,
  LocationItem,
  TemperatureUnit,
} from '@/types/weather';

// Default initial location: Kochi, India (or user's choice)
const DEFAULT_LOCATION: LocationItem = {
  id: 1273874,
  name: 'Kochi',
  latitude: 9.9312,
  longitude: 76.2673,
  country: 'India',
  timezone: 'Asia/Kolkata',
};

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<LocationItem>(DEFAULT_LOCATION);
  const [forecast, setForecast] = useState<WeatherForecastResponse | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<TemperatureUnit>('celsius');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Load weather & AQI for the active location
  const loadWeatherData = useCallback(async (loc: LocationItem, backgroundRefresh = false) => {
    if (!backgroundRefresh) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const [forecastRes, aqiRes] = await Promise.allSettled([
        weatherApi.getForecast(loc.latitude, loc.longitude),
        weatherApi.getAirQuality(loc.latitude, loc.longitude),
      ]);

      if (forecastRes.status === 'fulfilled') {
        setForecast(forecastRes.value);
      } else {
        throw new Error(forecastRes.reason?.message || 'Failed to load forecast data');
      }

      if (aqiRes.status === 'fulfilled') {
        setAirQuality(aqiRes.value);
      } else {
        setAirQuality(null);
      }
    } catch (err: any) {
      console.error('Weather fetching error:', err);
      setError(err?.message || 'Unable to retrieve meteorological data for this location.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Synchronize theme class on document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Initial load
  useEffect(() => {
    loadWeatherData(selectedLocation);
  }, [selectedLocation, loadWeatherData]);

  // Handle GPS location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const gpsLocation: LocationItem = {
          id: Date.now(),
          name: 'Current Location',
          latitude,
          longitude,
          country: '',
        };
        setSelectedLocation(gpsLocation);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation denied or failed:', err);
        alert('Could not access your location. Please check your browser location permissions.');
        setIsLocating(false);
      },
      { timeout: 10000 }
    );
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleToggleUnit = () => {
    setUnit((prev) => (prev === 'celsius' ? 'fahrenheit' : 'celsius'));
  };

  const currentWeather = forecast?.current;
  const todayDaily = forecast?.daily?.[0];

  return (
    <div className={`min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300 ${theme === 'light' ? 'light' : 'dark'}`}>
      {/* Weather-Responsive Dynamic Animated Background */}
      <WeatherBackground
        category={currentWeather?.weather_category}
        isDay={currentWeather?.is_day}
        theme={theme}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Navigation & Search Header */}
        <WeatherHeader
          onSelectCity={(loc) => setSelectedLocation(loc)}
          onUseCurrentLocation={handleUseCurrentLocation}
          onRefresh={() => loadWeatherData(selectedLocation, true)}
          isRefreshing={isRefreshing}
          isLocating={isLocating}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          unit={unit}
          onToggleUnit={handleToggleUnit}
        />

        {/* Content Loading & Error States */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={() => loadWeatherData(selectedLocation)} />
        ) : forecast && currentWeather ? (
          <main className="space-y-6">
            {/* Hero Banner */}
            <CurrentWeatherHero
              current={currentWeather}
              todayDaily={todayDaily}
              cityName={selectedLocation.name}
              countryName={selectedLocation.country}
              unit={unit}
            />

            {/* Hourly Forecast */}
            <HourlyForecast hourly={forecast.hourly} unit={unit} />

            {/* Two-Column Layout: Daily Outlook & Detailed Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WeeklyForecast daily={forecast.daily} unit={unit} />
              <WeatherMetrics current={currentWeather} todayDaily={todayDaily} />
            </div>

            {/* Bottom Row: Air Quality & Smart Weather Assistant */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AirQualityCard airQuality={airQuality} />
              <WeatherAssistant
                cityName={selectedLocation.name}
                weatherData={forecast}
                airQualityData={airQuality}
              />
            </div>
          </main>
        ) : null}

        {/* Footer with Open-Meteo Attribution */}
        <footer className="mt-12 text-center text-xs text-slate-600 dark:text-slate-400 py-4 border-t border-slate-300/40 dark:border-white/5 flex flex-col sm:flex-row items-center justify-center gap-2">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Atmos" className="w-5 h-5 rounded-md object-cover shadow-sm" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Atmos Weather Engine</span>
          </div>
          <span className="hidden sm:inline text-slate-400 dark:text-slate-600">•</span>
          <p>
            Powered by{' '}
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 dark:text-sky-400 hover:underline font-medium"
            >
              Open-Meteo API
            </a>{' '}
            • Free non-commercial attribution
          </p>
        </footer>
      </div>
    </div>
  );
}
