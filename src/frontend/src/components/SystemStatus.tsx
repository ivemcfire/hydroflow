// File: src/frontend/src/components/SystemStatus.tsx
import React from 'react';
import { useAppContext } from '../context/AppContext';

const SystemStatus: React.FC = () => {
  const { state } = useAppContext();

  if (!state.systemStatus) return null;

  const { color } = state.systemStatus;

  // Blue-Green Deployment indicator
  const bgColor = color === 'blue' ? 'bg-blue-600' : color === 'green' ? 'bg-green-600' : 'bg-gray-600';

  return (
    <div className={`${bgColor} text-white px-4 py-2 flex justify-between items-center shadow-md`}>
      <div className="flex items-center space-x-2">
        <span className="font-bold tracking-wider">HYDROFLOW</span>
        <span className="text-xs uppercase bg-white/20 px-2 py-1 rounded-full">
          {color} Env
        </span>
      </div>
      <div className="text-sm flex items-center">
        <span className="w-2 h-2 rounded-full bg-white animate-pulse mr-2"></span>
        System Online
      </div>
    </div>
  );
};

export default SystemStatus;
