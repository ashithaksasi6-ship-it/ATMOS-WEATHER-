'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CurrentWeather, DailyForecastItem, TemperatureUnit } from '@/types/weather';
import { formatTemperature, formatFullDate } from '@/utils/formatters';
import { WeatherIcon } from './WeatherIcon';
import { Wind, Droplets, Eye, Gauge } from 'lucide-react';

interface CurrentWeatherHeroProps {
  current: CurrentWeather;
  todayDaily?: DailyForecastItem;
  cityName: string;
  countryName?: string;
  unit: TemperatureUnit;
}

export const CurrentWeatherHero: React.FC<CurrentWeatherHeroProps> = ({
  current,
  todayDaily,
  cityName,
  countryName,
  unit,
}) => {
  const highTemp = todayDaily ? formatTemperature(todayDaily.temperature_max, unit) : '--';
  const lowTemp = todayDaily ? formatTemperature(todayDaily.temperature_min, unit) : '--';

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl border border-white/10 dark:border-white/5"
    >
      {/* Background Soft Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        {/* Left Side: City, Date, Weather condition */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              {cityName}
            </h2>
            {countryName && (
              <span className="text-sm px-2.5 py-0.5 rounded-full bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-medium border border-slate-300/40 dark:border-transparent">
                {countryName}
              </span>
            )}
          </div>

          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">
            {formatFullDate(current.time || new Date().toISOString())}
          </p>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/70 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-lg">
              <WeatherIcon iconName={current.weather_icon} size={36} className="text-sky-500 dark:text-sky-300" />
            </div>
            <div>
              <p className="text-xl font-semibold capitalize text-slate-900 dark:text-slate-100">
                {current.weather_description}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Feels like {formatTemperature(current.apparent_temperature, unit)}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Hero Temperature Typography */}
        <div className="flex flex-col items-start md:items-center">
          <div className="flex items-baseline">
            <span className="text-7xl md:text-8xl font-black tracking-tighter text-slate-900 dark:bg-gradient-to-b dark:from-white dark:via-slate-100 dark:to-slate-400 dark:bg-clip-text dark:text-transparent">
              {formatTemperature(current.temperature, unit).replace('°', '')}
            </span>
            <span className="text-4xl md:text-5xl font-light text-sky-500 dark:text-sky-400 ml-1">°</span>
          </div>

          <div className="flex items-center gap-3 mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
            <span>H: <strong className="text-slate-900 dark:text-slate-100">{highTemp}</strong></span>
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span>L: <strong className="text-slate-900 dark:text-slate-100">{lowTemp}</strong></span>
          </div>
        </div>

        {/* Right Side: Quick Micro-Metrics */}
        <div className="grid grid-cols-2 gap-3 self-stretch md:self-auto min-w-[240px]">
          <div className="glass-card rounded-2xl p-3 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500 dark:text-sky-400">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Humidity</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{current.relative_humidity}%</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-3 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Wind</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{Math.round(current.wind_speed)} km/h</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-3 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Visibility</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {(current.visibility / 1000).toFixed(1)} km
              </span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-3 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Pressure</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {Math.round(current.pressure_msl)} hPa
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
