'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { HourlyForecastItem, TemperatureUnit } from '@/types/weather';
import { formatHour, formatTemperature } from '@/utils/formatters';
import { WeatherIcon } from './WeatherIcon';
import { Droplet, Clock } from 'lucide-react';

interface HourlyForecastProps {
  hourly: HourlyForecastItem[];
  unit: TemperatureUnit;
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ hourly, unit }) => {
  // Take next 24 hours
  const hours24 = hourly.slice(0, 24);

  // Prepare chart data
  const chartData = hours24.map((item) => ({
    time: formatHour(item.time),
    temp: unit === 'fahrenheit' ? Math.round((item.temperature * 9) / 5 + 32) : Math.round(item.temperature),
    pop: item.precipitation_probability,
    weather_icon: item.weather_icon,
  }));

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-xl border border-white/10 dark:border-white/5 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-sky-500 dark:text-sky-400" />
          <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Hourly Forecast & Trend
          </h3>
        </div>
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Next 24 Hours</span>
      </div>

      {/* Temperature Trend Mini Chart */}
      <div className="h-28 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="hourlyTempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-xl shadow-xl text-xs backdrop-blur-md">
                      <p className="text-slate-600 dark:text-slate-400 font-medium">{payload[0].payload.time}</p>
                      <p className="text-sky-600 dark:text-sky-300 font-bold">{payload[0].value}°{unit === 'fahrenheit' ? 'F' : 'C'}</p>
                      {payload[0].payload.pop > 0 && (
                        <p className="text-blue-600 dark:text-blue-400 text-[11px]">Rain: {payload[0].payload.pop}%</p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="natural"
              dataKey="temp"
              stroke="#0284c7"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#hourlyTempGrad)"
              className="dark:stroke-sky-400"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Horizontally Scrollable Hourly Strip */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 pt-1">
        {hours24.map((item, index) => {
          const isCurrent = index === 0;
          return (
            <div
              key={item.time}
              className={`flex-shrink-0 flex flex-col items-center justify-between p-3.5 rounded-2xl min-w-[76px] transition-all ${
                isCurrent
                  ? 'bg-sky-500/15 border border-sky-400/50 shadow-md shadow-sky-500/10'
                  : 'glass-card'
              }`}
            >
              <span className={`text-xs font-semibold ${isCurrent ? 'text-sky-600 dark:text-sky-300' : 'text-slate-600 dark:text-slate-400'}`}>
                {isCurrent ? 'Now' : formatHour(item.time)}
              </span>

              <div className="my-2.5">
                <WeatherIcon iconName={item.weather_icon} size={24} className="text-sky-600 dark:text-sky-200" />
              </div>

              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {formatTemperature(item.temperature, unit)}
              </span>

              {/* Rain Chance indicator */}
              <div className="mt-2 flex items-center gap-0.5 text-[10px] text-blue-600 dark:text-blue-300 font-medium">
                <Droplet className="w-2.5 h-2.5" />
                <span>{item.precipitation_probability}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
