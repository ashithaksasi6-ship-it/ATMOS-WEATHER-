'use client';

import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Hero skeleton */}
      <div className="glass-panel rounded-3xl p-8 h-64 flex flex-col justify-between border border-slate-200 dark:border-white/5">
        <div className="space-y-3">
          <div className="h-8 bg-slate-300/60 dark:bg-white/10 rounded-xl w-48" />
          <div className="h-4 bg-slate-300/60 dark:bg-white/10 rounded-lg w-32" />
        </div>
        <div className="flex items-baseline gap-4">
          <div className="h-20 bg-slate-300/60 dark:bg-white/10 rounded-2xl w-40" />
          <div className="h-6 bg-slate-300/60 dark:bg-white/10 rounded-lg w-24" />
        </div>
      </div>

      {/* Hourly forecast skeleton */}
      <div className="glass-panel rounded-3xl p-6 h-48 border border-slate-200 dark:border-white/5 flex flex-col justify-between">
        <div className="h-6 bg-slate-300/60 dark:bg-white/10 rounded-lg w-36" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="min-w-[76px] h-28 bg-slate-200/70 dark:bg-white/5 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Grid skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-3xl p-6 h-72 border border-slate-200 dark:border-white/5" />
        <div className="glass-panel rounded-3xl p-6 h-72 border border-slate-200 dark:border-white/5" />
      </div>
    </div>
  );
};
