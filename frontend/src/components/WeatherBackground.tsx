'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface WeatherBackgroundProps {
  category?: string;
  isDay?: number;
  theme?: 'dark' | 'light';
}

export const WeatherBackground: React.FC<WeatherBackgroundProps> = ({
  category = 'clear',
  isDay = 1,
  theme = 'dark',
}) => {
  // Atmospheric background gradients based on weather & time of day
  const getGradient = () => {
    if (theme === 'light') {
      if (category === 'rain' || category === 'storm') {
        return 'from-slate-200 via-sky-100 to-indigo-100';
      }
      if (category === 'snow') {
        return 'from-blue-50 via-slate-100 to-sky-100';
      }
      return 'from-sky-200 via-blue-100 to-amber-50';
    }

    // Dark Mode
    if (isDay === 0) {
      // Night time
      if (category === 'rain' || category === 'storm') {
        return 'from-[#05070e] via-[#091124] to-[#040817]';
      }
      return 'from-[#070b19] via-[#0d1633] to-[#060a16]';
    }

    // Day time (Dark theme aesthetic)
    switch (category) {
      case 'clear':
        return 'from-[#0b1b3d] via-[#102a5c] to-[#081226]';
      case 'cloudy':
        return 'from-[#0e1726] via-[#1e293b] to-[#0a0f1d]';
      case 'rain':
        return 'from-[#0c1829] via-[#132845] to-[#060c14]';
      case 'storm':
        return 'from-[#120f26] via-[#1a1838] to-[#090714]';
      case 'snow':
        return 'from-[#101e33] via-[#1e3456] to-[#0a121f]';
      default:
        return 'from-[#0a1224] via-[#122347] to-[#070c18]';
    }
  };

  return (
    <div className={`fixed inset-0 -z-10 bg-gradient-to-br ${getGradient()} transition-colors duration-1000 overflow-hidden pointer-events-none`}>
      {/* Ambient glowing radial orbs */}
      <motion.div
        animate={{
          x: [0, 25, 0],
          y: [0, -35, 0],
          opacity: [0.35, 0.55, 0.35],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[110px] pointer-events-none ${
          theme === 'light'
            ? 'bg-amber-300/40'
            : category === 'clear' && isDay === 1
            ? 'bg-amber-500/20'
            : 'bg-cyan-500/15'
        }`}
      />

      <motion.div
        animate={{
          x: [0, -30, 0],
          y: [0, 40, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full blur-[130px] pointer-events-none ${
          theme === 'light'
            ? 'bg-sky-400/30'
            : category === 'storm'
            ? 'bg-purple-600/20'
            : 'bg-blue-600/20'
        }`}
      />

      <motion.div
        animate={{
          x: [0, 20, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-32 left-1/4 w-[32rem] h-[32rem] rounded-full blur-[140px] bg-indigo-600/15 pointer-events-none"
      />

      {/* Atmospheric rain or snow particle simulation overlay */}
      {category === 'rain' && (
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
      )}
      {category === 'snow' && (
        <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:32px_32px]" />
      )}
    </div>
  );
};
