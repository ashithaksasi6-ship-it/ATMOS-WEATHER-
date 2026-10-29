export function celsiusToFahrenheit(celsius: number): number {
  return Math.round((celsius * 9) / 5 + 32);
}

export function kmhToMph(kmh: number): number {
  return Math.round(kmh * 0.621371);
}

export function formatTemperature(celsius: number, unit: 'celsius' | 'fahrenheit'): string {
  const value = unit === 'fahrenheit' ? celsiusToFahrenheit(celsius) : Math.round(celsius);
  return `${value}°`;
}

export function formatSpeed(kmh: number, unit: 'kmh' | 'mph'): string {
  const value = unit === 'mph' ? kmhToMph(kmh) : Math.round(kmh);
  return `${value} ${unit === 'mph' ? 'mph' : 'km/h'}`;
}

export function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch {
    return isoString;
  }
}

export function formatHour(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: 'numeric', hour12: true });
  } catch {
    return isoString;
  }
}

export function formatDayName(dateString: string): string {
  try {
    const date = new Date(dateString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    return date.toLocaleDateString([], { weekday: 'short' });
  } catch {
    return dateString;
  }
}

export function formatFullDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  } catch {
    return dateString;
  }
}

export function getUVLevel(uv: number): { text: string; color: string } {
  if (uv <= 2) return { text: 'Low', color: 'text-emerald-400' };
  if (uv <= 5) return { text: 'Moderate', color: 'text-amber-400' };
  if (uv <= 7) return { text: 'High', color: 'text-orange-400' };
  if (uv <= 10) return { text: 'Very High', color: 'text-rose-500' };
  return { text: 'Extreme', color: 'text-purple-500' };
}
