// File: src/frontend/src/components/AiInsights.tsx
import React from 'react';
import { Sparkles, RefreshCw, Droplets, CloudRain, AlertTriangle } from 'lucide-react';

const AiInsights = () => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-[#00a3ff]">
          <Sparkles size={20} />
          <h2 className="text-sm font-bold tracking-wide uppercase">AI System Insights</h2>
        </div>
        <button className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-start gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mt-0.5">
            <CloudRain size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">Weather Optimization</h4>
            <p className="text-sm text-slate-600 leading-relaxed">Heavy rain expected tomorrow. AI has automatically paused the scheduled watering for <strong>Zone 1</strong> and <strong>Zone 2</strong> to save 45L of water.</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
          <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 mt-0.5">
            <Droplets size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">Soil Moisture Trend</h4>
            <p className="text-sm text-slate-600 leading-relaxed">Greenhouse soil humidity is perfectly stable at 62%. The current micro-dosing schedule is highly effective.</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 bg-orange-50/50 rounded-xl border border-orange-100/50">
          <div className="bg-orange-100 p-2 rounded-lg text-orange-600 mt-0.5">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">Anomaly Detected</h4>
            <p className="text-sm text-slate-600 leading-relaxed">Main Pump pressure dropped by 15% during the last cycle. Consider checking the filter for blockages.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiInsights;
