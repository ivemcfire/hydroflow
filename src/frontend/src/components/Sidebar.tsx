// File: src/frontend/src/components/Sidebar.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';
import { CloudRain, Sun, Wind, Droplets, Activity, ChevronDown, Check, AlertCircle } from 'lucide-react';

const MOCK_DATA = {
  soilHumidity: Array.from({ length: 30 }, (_, i) => ({ day: i + 1, value: 40 + Math.random() * 30 })),
  waterLevel: Array.from({ length: 30 }, (_, i) => ({ day: i + 1, value: 90 - (i * 1.5) + (Math.random() * 5) })),
  waterConsumption: Array.from({ length: 7 }, (_, i) => ({ day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i], value: 120 + Math.random() * 50 })),
  temperature: Array.from({ length: 30 }, (_, i) => ({ day: i + 1, value: 20 + Math.sin(i / 4) * 5 + Math.random() * 2 })),
  pumpEnergy: Array.from({ length: 7 }, (_, i) => ({ day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i], value: 4.5 + Math.random() * 2 })),
  zoneVolume: Array.from({ length: 30 }, (_, i) => ({ day: i + 1, zone1: 30 + Math.random() * 10, zone2: 25 + Math.random() * 15 })),
  uptime: Array.from({ length: 30 }, (_, i) => ({ day: i + 1, value: 99.5 + Math.random() * 0.5 })),
  nutrients: Array.from({ length: 7 }, (_, i) => ({ day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i], value: 800 + Math.random() * 100 })),
  solar: Array.from({ length: 7 }, (_, i) => ({ day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i], value: 12 + Math.random() * 6 })),
  valveActuation: Array.from({ length: 7 }, (_, i) => ({ day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i], value: 15 + Math.floor(Math.random() * 10) })),
};

const GRAPHS = [
  { id: 'soilHumidity', name: 'Soil Humidity (Monthly)', type: 'area', data: MOCK_DATA.soilHumidity, color: '#0ea5e9', unit: '%' },
  { id: 'waterLevel', name: 'Main Tank Water Level (Monthly)', type: 'area', data: MOCK_DATA.waterLevel, color: '#3b82f6', unit: '%' },
  { id: 'waterConsumption', name: 'Water Consumption (Weekly)', type: 'bar', data: MOCK_DATA.waterConsumption, color: '#06b6d4', unit: 'L' },
  { id: 'temperature', name: 'Average Temperature (Monthly)', type: 'line', data: MOCK_DATA.temperature, color: '#f59e0b', unit: '°C' },
  { id: 'pumpEnergy', name: 'Pump Energy Usage (Weekly)', type: 'bar', data: MOCK_DATA.pumpEnergy, color: '#8b5cf6', unit: 'kWh' },
  { id: 'zoneVolume', name: 'Zone 1 vs Zone 2 Volume (Monthly)', type: 'composed', data: MOCK_DATA.zoneVolume, color: '#10b981', unit: 'L' },
  { id: 'uptime', name: 'System Uptime (Monthly)', type: 'line', data: MOCK_DATA.uptime, color: '#22c55e', unit: '%' },
  { id: 'nutrients', name: 'Nutrient Concentration (Weekly)', type: 'line', data: MOCK_DATA.nutrients, color: '#ec4899', unit: 'ppm' },
  { id: 'solar', name: 'Solar Power Generation (Weekly)', type: 'area', data: MOCK_DATA.solar, color: '#eab308', unit: 'kWh' },
  { id: 'valveActuation', name: 'Valve Actuation Frequency (Weekly)', type: 'bar', data: MOCK_DATA.valveActuation, color: '#6366f1', unit: 'times' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const Sidebar = () => {
  const [selectedGraphId, setSelectedGraphId] = useState('soilHumidity');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const activeGraph = GRAPHS.find(g => g.id === selectedGraphId) || GRAPHS[0];

  const renderChart = () => {
    if (activeGraph.id === 'zoneVolume') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={activeGraph.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
              cursor={{ fill: '#f1f5f9' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
            <Bar dataKey="zone1" name="Zone 1" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="zone2" name="Zone 2" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (activeGraph.type === 'bar') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={activeGraph.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
              cursor={{ fill: '#f1f5f9' }}
              formatter={(value: number) => [`${value.toFixed(1)} ${activeGraph.unit}`, activeGraph.name]}
            />
            <Bar dataKey="value" fill={activeGraph.color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (activeGraph.type === 'line') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={activeGraph.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} domain={['auto', 'auto']} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
              formatter={(value: number) => [`${value.toFixed(1)} ${activeGraph.unit}`, activeGraph.name]}
            />
            <Line type="monotone" dataKey="value" stroke={activeGraph.color} strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={activeGraph.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`color-${activeGraph.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={activeGraph.color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={activeGraph.color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} domain={['auto', 'auto']} />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
            formatter={(value: number) => [`${value.toFixed(1)} ${activeGraph.unit}`, activeGraph.name]}
          />
          <Area type="monotone" dataKey="value" stroke={activeGraph.color} strokeWidth={3} fillOpacity={1} fill={`url(#color-${activeGraph.id})`} />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 w-full"
    >
      {/* Analytics Graph */}
      <motion.div id="analytics" variants={item} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col h-[350px]">
        <div className="flex justify-between items-start mb-4 relative">
          <div className="pr-2">
            <h3 className="text-sm font-bold text-slate-800 line-clamp-1" title={activeGraph.name}>{activeGraph.name}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Historical data</p>
          </div>
          
          {/* Custom Dropdown */}
          <div className="relative shrink-0">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              Select <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsDropdownOpen(false)}></div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-40 max-h-64 overflow-y-auto"
                  >
                    {GRAPHS.map(graph => (
                      <button
                        key={graph.id}
                        onClick={() => {
                          setSelectedGraphId(graph.id);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 flex items-center justify-between transition-colors"
                      >
                        <span className={`font-medium ${selectedGraphId === graph.id ? 'text-[#00a3ff]' : 'text-slate-700'}`}>
                          {graph.name}
                        </span>
                        {selectedGraphId === graph.id && <Check size={14} className="text-[#00a3ff]" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="flex-1 w-full min-h-0">
          {renderChart()}
        </div>
      </motion.div>

      {/* Weather Widget */}
      <motion.div id="weather" variants={item} className="bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl p-5 shadow-md text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-base font-bold">Weather Forecast</h3>
              <p className="text-sky-100 text-[10px] mt-0.5">San Francisco, CA</p>
            </div>
            <Sun size={24} className="text-yellow-300 drop-shadow-sm" />
          </div>
          
          <div className="flex items-end gap-2 mb-5">
            <span className="text-4xl font-bold tracking-tighter">24°</span>
            <span className="text-sky-100 text-sm font-medium mb-1">Mostly Sunny</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 bg-white/10 rounded-xl p-2 backdrop-blur-sm border border-white/20">
            <div className="text-center">
              <Droplets size={14} className="mx-auto text-sky-200 mb-1" />
              <p className="text-[9px] text-sky-100 uppercase tracking-wider">Humidity</p>
              <p className="text-xs font-bold">42%</p>
            </div>
            <div className="text-center border-x border-white/10">
              <Wind size={14} className="mx-auto text-sky-200 mb-1" />
              <p className="text-[9px] text-sky-100 uppercase tracking-wider">Wind</p>
              <p className="text-xs font-bold">12 km/h</p>
            </div>
            <div className="text-center">
              <CloudRain size={14} className="mx-auto text-sky-200 mb-1" />
              <p className="text-[9px] text-sky-100 uppercase tracking-wider">Rain</p>
              <p className="text-xs font-bold">0%</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* System Health Widget */}
      <motion.div id="system-health" variants={item} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Activity className="text-emerald-500" size={18} />
          System Health
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Check size={14} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Overall Status</p>
                <p className="text-[10px] text-emerald-600 font-medium">Optimal</p>
              </div>
            </div>
            <span className="text-sm font-bold text-emerald-600">99.8%</span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-xl border border-amber-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <AlertCircle size={14} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Active Alerts</p>
                <p className="text-[10px] text-amber-600 font-medium">1 Minor Warning</p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-600">Filter Check</span>
          </div>

          <div className="pt-1">
            <div className="flex justify-between text-[10px] mb-1">
              <span className="font-semibold text-slate-600">Storage Capacity</span>
              <span className="font-bold text-slate-800">45%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#00a3ff] h-1.5 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="font-semibold text-slate-600">API Response Time</span>
              <span className="font-bold text-slate-800">124ms</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '20%' }}></div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Sidebar;
