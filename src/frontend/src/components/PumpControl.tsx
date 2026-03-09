// File: src/frontend/src/components/PumpControl.tsx
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { togglePump } from '../services/api';
import { Power, Activity } from 'lucide-react';

type PumpProps = {
  pump: {
    id: string;
    name: string;
    status: 'on' | 'off';
    flowRate: number;
  };
};

const PumpControl: React.FC<PumpProps> = ({ pump }) => {
  const { dispatch } = useAppContext();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const updatedPump = await togglePump(pump.id);
      dispatch({ type: 'UPDATE_PUMP', payload: updatedPump });
    } catch (error) {
      console.error('Failed to toggle pump', error);
    } finally {
      setLoading(false);
    }
  };

  const isOn = pump.status === 'on';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{pump.name}</h3>
          <p className="text-sm text-gray-500 font-mono mt-1">ID: {pump.id}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${isOn ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
          {pump.status}
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center py-6">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 text-3xl font-light text-gray-700">
            <Activity className={`w-8 h-8 ${isOn ? 'text-emerald-500 animate-pulse' : 'text-gray-300'}`} />
            <span>{pump.flowRate.toFixed(1)}</span>
            <span className="text-lg text-gray-400">L/min</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleToggle}
        disabled={loading}
        className={`mt-4 w-full flex items-center justify-center py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
          isOn 
            ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' 
            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Power className="w-4 h-4 mr-2" />
        {isOn ? 'Turn Off' : 'Turn On'}
      </button>
    </div>
  );
};

export default PumpControl;
