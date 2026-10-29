'use client';

import React from 'react';
import { AirQualityResponse } from '@/types/weather';
import { Wind, ShieldCheck, AlertCircle } from 'lucide-react';

interface AirQualityCardProps {
  airQuality?: AirQualityResponse | null;
}

export const AirQualityCard: React.FC<AirQualityCardProps> = ({ airQuality }) => {
  if (!airQuality) {
    return (
      <div className="glass-panel rounded-3xl p-6 shadow-xl border border-white/10 dark:border-white/5 flex flex-col items-center justify-center text-slate-400 py-10">
        <Wind className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">Air quality readings unavailable for this location</p>
      </div>
    );
  }

  const euAqi = airQuality.european_aqi ?? 'N/A';
  const desc = airQuality.aqi_description;
  const color = airQuality.aqi_color || '#10b981';

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-xl border border-white/10 dark:border-white/5 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wind className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Air Quality Index
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/5">
          European AQI Scale (0–100+)
        </span>
      </div>

      {/* Main AQI Badge & Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 shadow-xs">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black shadow-lg"
            style={{
              backgroundColor: `${color}25`,
              border: `2px solid ${color}`,
              color: color,
            }}
          >
            <span className="text-2xl leading-none">{euAqi}</span>
            <span className="text-[10px] uppercase font-semibold mt-0.5">AQI</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{desc}</span>
              {desc === 'Good' || desc === 'Fair' ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-sm font-medium">
              {desc === 'Good'
                ? 'Air quality is considered satisfactory, and air pollution poses little or no risk.'
                : desc === 'Fair'
                ? 'Air quality is acceptable; some pollutants may cause moderate concern for very sensitive individuals.'
                : desc === 'Moderate'
                ? 'Members of sensitive groups may experience mild health effects; general public is less likely to be affected.'
                : 'Health alert: increased likelihood of adverse effects for everyone.'}
            </p>
          </div>
        </div>

        {airQuality.us_aqi !== undefined && (
          <div className="text-right sm:border-l sm:border-slate-200 dark:sm:border-white/10 sm:pl-4">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">US AQI Equivalent</span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-slate-200">{airQuality.us_aqi}</span>
          </div>
        )}
      </div>

      {/* Detailed Pollutants Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="glass-card rounded-2xl p-3 flex flex-col justify-between">
          <span className="text-slate-600 dark:text-slate-400 font-semibold">PM2.5 (Fine)</span>
          <div className="my-1">
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {airQuality.pm2_5 !== undefined && airQuality.pm2_5 !== null ? airQuality.pm2_5.toFixed(1) : '--'}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1">µg/m³</span>
          </div>
          <span className="text-[10px] text-slate-500">Respirable particles</span>
        </div>

        <div className="glass-card rounded-2xl p-3 flex flex-col justify-between">
          <span className="text-slate-600 dark:text-slate-400 font-semibold">PM10 (Coarse)</span>
          <div className="my-1">
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {airQuality.pm10 !== undefined && airQuality.pm10 !== null ? airQuality.pm10.toFixed(1) : '--'}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1">µg/m³</span>
          </div>
          <span className="text-[10px] text-slate-500">Dust & pollen particles</span>
        </div>

        <div className="glass-card rounded-2xl p-3 flex flex-col justify-between">
          <span className="text-slate-600 dark:text-slate-400 font-semibold">Nitrogen Dioxide (NO₂)</span>
          <div className="my-1">
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {airQuality.nitrogen_dioxide !== undefined && airQuality.nitrogen_dioxide !== null ? airQuality.nitrogen_dioxide.toFixed(1) : '--'}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1">µg/m³</span>
          </div>
          <span className="text-[10px] text-slate-500">Vehicle emissions</span>
        </div>

        <div className="glass-card rounded-2xl p-3 flex flex-col justify-between">
          <span className="text-slate-600 dark:text-slate-400 font-semibold">Ozone (O₃)</span>
          <div className="my-1">
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {airQuality.ozone !== undefined && airQuality.ozone !== null ? airQuality.ozone.toFixed(1) : '--'}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1">µg/m³</span>
          </div>
          <span className="text-[10px] text-slate-500">Ground-level smog</span>
        </div>
      </div>
    </div>
  );
};
