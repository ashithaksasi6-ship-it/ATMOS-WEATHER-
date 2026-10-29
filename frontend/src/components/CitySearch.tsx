'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import { LocationItem } from '@/types/weather';
import { weatherApi } from '@/services/api';

interface CitySearchProps {
  onSelectCity: (location: LocationItem) => void;
  onUseCurrentLocation: () => void;
  isLocating?: boolean;
}

export const CitySearch: React.FC<CitySearchProps> = ({
  onSelectCity,
  onUseCurrentLocation,
  isLocating = false,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce city search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await weatherApi.searchLocations(query.trim());
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error('Error fetching cities', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 320);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>

        <input
          id="city-search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          placeholder="Search city, state or country..."
          className="w-full pl-10 pr-24 py-2.5 rounded-full text-sm bg-white/70 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 border border-slate-300 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-sky-500/50 backdrop-blur-md transition-all shadow-inner"
        />

        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute right-12 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={onUseCurrentLocation}
          disabled={isLocating}
          title="Use my current GPS location"
          className="absolute right-2 px-2.5 py-1.5 rounded-full bg-sky-500/15 hover:bg-sky-500/25 text-sky-600 dark:text-sky-400 border border-sky-400/30 text-xs font-semibold flex items-center gap-1 transition-all"
        >
          {isLocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <MapPin className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">GPS</span>
        </button>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 py-1.5 glass-panel rounded-2xl shadow-2xl z-50 overflow-hidden border border-slate-200 dark:border-slate-700/60">
          {results.map((loc) => (
            <button
              key={`${loc.id}-${loc.latitude}-${loc.longitude}`}
              onClick={() => {
                onSelectCity(loc);
                setIsOpen(false);
                setQuery(`${loc.name}${loc.country ? ', ' + loc.country : ''}`);
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between group"
            >
              <div>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  {loc.name}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                  {[loc.admin1, loc.country].filter(Boolean).join(', ')}
                </span>
              </div>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full border border-slate-200 dark:border-transparent">
                {loc.timezone || 'UTC'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
