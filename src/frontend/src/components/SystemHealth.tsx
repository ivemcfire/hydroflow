// File: src/frontend/src/components/SystemHealth.tsx
import React from 'react';
import { BarChart2 } from 'lucide-react';

const SystemHealth = () => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-slate-800 p-1.5 rounded-lg text-white">
          <BarChart2 size={16} />
        </div>
        <h2 className="text-lg font-bold text-slate-800">System Health</h2>
      </div>
      
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-slate-600">Active Pumps</span>
            <span className="text-sm font-bold text-slate-800">2 / 5</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#00a3ff] rounded-full" style={{ width: '40%' }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-slate-600">Water Storage</span>
            <span className="text-sm font-bold text-slate-800">78%</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '78%' }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-slate-600">Avg Soil Humidity</span>
            <span className="text-sm font-bold text-slate-800">62%</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '62%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;
