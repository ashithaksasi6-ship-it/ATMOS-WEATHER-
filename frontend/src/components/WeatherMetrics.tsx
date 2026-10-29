'use client';

import React from 'react';
import { CurrentWeather, DailyForecastItem } from '@/types/weather';
import { formatTime, getUVLevel } from '@/utils/formatters';
import { Sun, Sunset, Compass, Droplets, Gauge, Eye, ShieldAlert } from 'lucide-react';

interface WeatherMetricsProps {
  current: CurrentWeather;
  todayDaily?: DailyForecastItem;
}

export const WeatherMetrics: React.FC<WeatherMetricsProps> = ({ current, todayDaily }) => {
  const uvInfo = getUVLevel(current.uv_index);

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-xl border border-white/10 dark:border-white/5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Compass className="w-5 h-5 text-sky-500 dark:text-sky-400" />
        <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Weather Insights & Details
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        {/* UV Index Card */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">UV Index</span>
            <Sun className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{current.uv_index.toFixed(1)}</span>
            <span className={`text-xs ml-2 font-bold ${uvInfo.color}`}>{uvInfo.text}</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {current.uv_index <= 2 ? 'Minimal sun protection needed' : 'Sun protection recommended during midday'}
          </p>
        </div>

        {/* Sunrise & Sunset Card */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Sun Cycle</span>
            <Sunset className="w-4 h-4 text-orange-500 dark:text-orange-400" />
          </div>
          <div className="my-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Sunrise:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {todayDaily?.sunrise ? formatTime(todayDaily.sunrise) : '--'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Sunset:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {todayDaily?.sunset ? formatTime(todayDaily.sunset) : '--'}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Local astronomical solar hours</p>
        </div>

        {/* Wind & Gusts Card */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Wind & Direction</span>
            <Compass className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{Math.round(current.wind_speed)}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">km/h</span>
            <div className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-1">
              Direction: {current.wind_direction}°
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Max gusts today: {todayDaily?.wind_speed_max ? Math.round(todayDaily.wind_speed_max) : '--'} km/h
          </p>
        </div>

        {/* Humidity Card */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Relative Humidity</span>
            <Droplets className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{current.relative_humidity}%</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {current.relative_humidity > 70
              ? 'High moisture levels; muggy feel'
              : current.relative_humidity < 30
              ? 'Dry air; keep hydrated'
              : 'Comfortable ambient moisture'}
          </p>
        </div>

        {/* Pressure Card */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Pressure</span>
            <Gauge className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{Math.round(current.pressure_msl)}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">hPa</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {current.pressure_msl >= 1013 ? 'High pressure system (stable)' : 'Low pressure system (active)'}
          </p>
        </div>

        {/* Visibility Card */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Horizontal Visibility</span>
            <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {(current.visibility / 1000).toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">km</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {current.visibility >= 9000 ? 'Clear line-of-sight' : 'Haze or mist in effect'}
          </p>
        </div>
      </div>
    </div>
  );
};
