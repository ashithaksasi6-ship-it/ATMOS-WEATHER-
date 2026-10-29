'use client';

import React from 'react';
import {
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  CloudDrizzle,
  Wind,
} from 'lucide-react';

interface WeatherIconProps {
  iconName: string;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  iconName,
  className = 'w-6 h-6',
  size = 24,
}) => {
  const norm = iconName.toLowerCase();

  if (norm.includes('clear-night') || norm.includes('night')) {
    return <Moon size={size} className={className || 'text-indigo-300'} />;
  }
  if (norm.includes('clear') || norm.includes('sun')) {
    return <Sun size={size} className={className || 'text-amber-400'} />;
  }
  if (norm.includes('thunder') || norm.includes('storm')) {
    return <CloudLightning size={size} className={className || 'text-yellow-400'} />;
  }
  if (norm.includes('snow') || norm.includes('sleet') || norm.includes('hail')) {
    return <CloudSnow size={size} className={className || 'text-sky-200'} />;
  }
  if (norm.includes('drizzle')) {
    return <CloudDrizzle size={size} className={className || 'text-blue-300'} />;
  }
  if (norm.includes('rain')) {
    return <CloudRain size={size} className={className || 'text-blue-400'} />;
  }
  if (norm.includes('fog')) {
    return <CloudFog size={size} className={className || 'text-slate-400'} />;
  }
  if (norm.includes('wind')) {
    return <Wind size={size} className={className || 'text-teal-300'} />;
  }

  return <Cloud size={size} className={className || 'text-sky-300'} />;
};
