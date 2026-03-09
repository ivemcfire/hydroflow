// File: src/frontend/src/components/RecentActivity.tsx
import React from 'react';
import { History } from 'lucide-react';

const RecentActivity = () => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-h-[200px] flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <History size={20} className="text-slate-800" />
        <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
      </div>
      
      <div className="flex-grow flex items-center justify-center">
        <p className="text-sm text-slate-400">No recent activity</p>
      </div>
    </div>
  );
};

export default RecentActivity;
