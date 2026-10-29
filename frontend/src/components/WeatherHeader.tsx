'use client';

import React from 'react';
import { CloudSun, Sun, Moon, RotateCcw } from 'lucide-react';
import { CitySearch } from './CitySearch';
import { LocationItem, TemperatureUnit } from '@/types/weather';

interface WeatherHeaderProps {
  onSelectCity: (loc: LocationItem) => void;
  onUseCurrentLocation: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  isLocating?: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  unit: TemperatureUnit;
  onToggleUnit: () => void;
}

export const WeatherHeader: React.FC<WeatherHeaderProps> = ({
  onSelectCity,
  onUseCurrentLocation,
  onRefresh,
  isRefreshing = false,
  isLocating = false,
  theme,
  onToggleTheme,
  unit,
  onToggleUnit,
}) => {
  return (
    <header className="w-full glass-panel rounded-3xl px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 mb-6 shadow-xl border border-white/10 dark:border-white/5">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3 self-start md:self-center">
        <div className="relative w-10 h-10 rounded-2xl overflow-hidden shadow-lg shadow-sky-500/25 border border-white/20 dark:border-white/10 flex-shrink-0 bg-gradient-to-tr from-sky-400 to-indigo-600">
          <img
            src="/logo.png"
            alt="Atmos Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-sky-600 dark:bg-gradient-to-r dark:from-sky-400 dark:via-indigo-200 dark:to-white dark:bg-clip-text dark:text-transparent">
            ATMOS
          </h1>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
            Hyperlocal Intelligence
          </p>
        </div>
      </div>

      {/* City Search Bar */}
      <div className="w-full md:max-w-md">
        <CitySearch
          onSelectCity={onSelectCity}
          onUseCurrentLocation={onUseCurrentLocation}
          isLocating={isLocating}
        />
      </div>

      {/* Controls & Actions */}
      <div className="flex items-center gap-2 self-end md:self-center">
        {/* Unit Toggle */}
        <button
          onClick={onToggleUnit}
          title={`Switch to ${unit === 'celsius' ? 'Fahrenheit' : 'Celsius'}`}
          className="px-3 py-1.5 rounded-full text-xs font-semibold glass-card text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-300 border border-slate-300/60 dark:border-white/10 transition-colors shadow-sm"
        >
          {unit === 'celsius' ? '°C' : '°F'}
        </button>

        {/* Refresh Weather */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh current forecast"
          className="p-2 rounded-full glass-card text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-300 border border-slate-300/60 dark:border-white/10 transition-all shadow-sm"
        >
          <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-500 dark:text-sky-400' : ''}`} />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          className="p-2 rounded-full glass-card text-slate-700 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 border border-slate-300/60 dark:border-white/10 transition-all shadow-sm"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>
      </div>
    </header>
  );
};
