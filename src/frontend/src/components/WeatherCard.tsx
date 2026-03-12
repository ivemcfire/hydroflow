// File: src/frontend/src/components/WeatherCard.tsx
import React, { useState, useEffect } from 'react';
import { Sun, CloudRain, Cloud, CloudLightning, CloudSun, Snowflake, Wind } from 'lucide-react';

type ForecastDay = { day: string; temp: string; condition: string };
type WeatherData = {
  location: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  condition: string;
  forecast: ForecastDay[];
};

const conditionIcon = (condition: string, size = 16) => {
  switch (condition) {
    case 'clear':         return <Sun size={size} />;
    case 'partly_cloudy': return <CloudSun size={size} />;
    case 'rain':          return <CloudRain size={size} />;
    case 'thunder':       return <CloudLightning size={size} />;
    case 'snow':          return <Snowflake size={size} />;
    default:              return <Cloud size={size} />;
  }
};

const WeatherCard = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/weather')
      .then(r => r.json())
      .then(d => setWeather(d))
      .catch(() => setError(true));
  }, []);

  if (error) return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <p className="text-sm text-slate-400 text-center py-8">Weather unavailable</p>
    </div>
  );

  if (!weather) return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse">
      <div className="h-4 bg-slate-100 rounded w-1/3 mb-4" />
      <div className="h-10 bg-slate-100 rounded w-1/2 mb-6" />
      <div className="h-20 bg-slate-100 rounded" />
    </div>
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-sm font-medium text-slate-500 mb-1">{weather.location}</h2>
          <div className="text-4xl font-bold text-slate-800">{weather.temperature}°C</div>
        </div>
        <div className="text-[#00a3ff]">
          {conditionIcon(weather.condition, 32)}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6 text-center divide-x divide-slate-100">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Humidity</p>
          <p className="text-sm font-bold text-slate-800">{weather.humidity}%</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Rain</p>
          <p className="text-sm font-bold text-slate-800">{weather.precipitation}%</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Wind</p>
          <p className="text-sm font-bold text-slate-800">{weather.windSpeed} km/h</p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <p className="text-xs font-bold text-slate-800 mb-3">7-Day Forecast</p>
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {weather.forecast.map((f, i) => (
            <div key={i} className="flex flex-col items-center min-w-[3.5rem] bg-slate-50 rounded-xl py-2 border border-slate-100">
              <span className="text-[10px] font-medium text-slate-500 mb-1">{f.day}</span>
              <span className="text-slate-600 mb-1">{conditionIcon(f.condition, 16)}</span>
              <span className="text-xs font-bold text-slate-800">{f.temp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
