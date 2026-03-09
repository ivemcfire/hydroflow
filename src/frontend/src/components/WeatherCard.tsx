// File: src/frontend/src/components/WeatherCard.tsx
import React from 'react';
import { Sun, CloudRain, Cloud, CloudLightning, CloudSun } from 'lucide-react';

const forecast = [
  { day: 'Mon', icon: Sun, temp: '24°' },
  { day: 'Tue', icon: CloudSun, temp: '22°' },
  { day: 'Wed', icon: CloudRain, temp: '19°' },
  { day: 'Thu', icon: Cloud, temp: '20°' },
  { day: 'Fri', icon: CloudLightning, temp: '21°' },
  { day: 'Sat', icon: Sun, temp: '25°' },
  { day: 'Sun', icon: Sun, temp: '26°' },
];

const WeatherCard = () => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-sm font-medium text-slate-500 mb-1">Local Weather</h2>
          <div className="text-4xl font-bold text-slate-800">24°C</div>
        </div>
        <div className="text-[#00a3ff]">
          <Sun size={32} />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-6 text-center divide-x divide-slate-100">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Humidity</p>
          <p className="text-sm font-bold text-slate-800">45%</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Rain</p>
          <p className="text-sm font-bold text-slate-800">5%</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Wind</p>
          <p className="text-sm font-bold text-slate-800">12 km/h</p>
        </div>
      </div>
      
      <div className="pt-4 border-t border-slate-100">
        <p className="text-xs font-bold text-slate-800 mb-3">7-Day Forecast</p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {forecast.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="flex flex-col items-center min-w-[3.5rem] bg-slate-50 rounded-xl py-2 border border-slate-100">
                <span className="text-[10px] font-medium text-slate-500 mb-1">{f.day}</span>
                <Icon size={16} className="text-slate-600 mb-1" />
                <span className="text-xs font-bold text-slate-800">{f.temp}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
