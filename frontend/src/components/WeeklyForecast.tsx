'use client';

import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, Droplets, Wind, Sun } from 'lucide-react';
import { DailyForecastItem, TemperatureUnit } from '@/types/weather';
import { formatDayName, formatTemperature, formatTime } from '@/utils/formatters';
import { WeatherIcon } from './WeatherIcon';

interface WeeklyForecastProps {
  daily: DailyForecastItem[];
  unit: TemperatureUnit;
}

export const WeeklyForecast: React.FC<WeeklyForecastProps> = ({ daily, unit }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-xl border border-white/10 dark:border-white/5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            7-Day Outlook
          </h3>
        </div>
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Daily Breakdown</span>
      </div>

      <div className="flex flex-col gap-2">
        {daily.map((day, idx) => {
          const isExpanded = expandedIndex === idx;
          const dayName = formatDayName(day.date);

          return (
            <div
              key={day.date}
              className="glass-card rounded-2xl overflow-hidden transition-all duration-200"
            >
              {/* Row Summary */}
              <button
                onClick={() => toggleExpand(idx)}
                className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-slate-100/60 dark:hover:bg-white/5 transition-colors"
              >
                <div className="w-24">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{dayName}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{day.date.slice(5)}</p>
                </div>

                <div className="flex items-center gap-2.5 flex-1 max-w-[140px]">
                  <WeatherIcon iconName={day.weather_icon} size={22} className="text-sky-600 dark:text-sky-300" />
                  <span className="text-xs text-slate-700 dark:text-slate-300 truncate hidden sm:inline">
                    {day.weather_description}
                  </span>
                </div>

                {/* Rain probability */}
                <div className="w-16 text-right">
                  {day.precipitation_probability_max > 0 ? (
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                      {day.precipitation_probability_max}%
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500">0%</span>
                  )}
                </div>

                {/* Temperature High - Low */}
                <div className="flex items-center gap-2 w-24 justify-end">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {formatTemperature(day.temperature_max, unit)}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {formatTemperature(day.temperature_min, unit)}
                  </span>
                </div>

                <div className="text-slate-500 dark:text-slate-400 pl-1">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Expandable Daily Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-in fade-in-50">
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-transparent flex items-center gap-2 shadow-xs">
                    <Sun className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Sunrise / Sunset</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {day.sunrise ? formatTime(day.sunrise) : '--'} / {day.sunset ? formatTime(day.sunset) : '--'}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-transparent flex items-center gap-2 shadow-xs">
                    <Sun className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Max UV Index</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{day.uv_index_max}</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-transparent flex items-center gap-2 shadow-xs">
                    <Wind className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Max Wind</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{Math.round(day.wind_speed_max)} km/h</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-transparent flex items-center gap-2 shadow-xs">
                    <Droplets className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Precipitation Sum</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{day.precipitation_sum} mm</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
