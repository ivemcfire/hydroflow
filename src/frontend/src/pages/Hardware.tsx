// File: src/frontend/src/pages/Hardware.tsx
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Activity, X, Edit2, Trash2 } from 'lucide-react';

const PumpIcon = ({ isOn }: { isOn: boolean }) => {
  const color = isOn ? "#3b82f6" : "#94a3b8";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="7" width="12" height="10" rx="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 12h6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 9v6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {isOn ? (
        <g stroke="#3b82f6" strokeWidth="2" strokeLinecap="round">
          <path d="M15 12h3" strokeDasharray="2 4">
            <animate attributeName="stroke-dashoffset" values="6;0" dur="0.5s" repeatCount="indefinite" />
          </path>
          <circle cx="8" cy="12" r="2" fill="#3b82f6">
            <animateTransform attributeName="transform" type="rotate" from="0 8 12" to="360 8 12" dur="0.5s" repeatCount="indefinite" />
          </circle>
        </g>
      ) : (
        <circle cx="8" cy="12" r="2" fill="#94a3b8" />
      )}
    </svg>
  );
};

const ValveIcon = ({ isOn }: { isOn: boolean }) => {
  const color = isOn ? "#6366f1" : "#94a3b8";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 10h16v4H4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 10V4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 4h8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {isOn ? (
        <g stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
          <path d="M6 12h12" strokeDasharray="4 4">
            <animate attributeName="stroke-dashoffset" values="8;0" dur="0.5s" repeatCount="indefinite" />
          </path>
        </g>
      ) : (
        <path d="M12 10v4" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      )}
    </svg>
  );
};

const FlowerIcon = ({ humidity }: { humidity: number }) => {
  const isDry = humidity < 40;
  const isFlooded = humidity > 70;
  const isHealthy = !isDry && !isFlooded;

  const color = isDry ? "#94a3b8" : isFlooded ? "#1e3a8a" : "#22c55e";

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22V12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {isDry ? (
        <g stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 18c-2 0-4 1-4 3" />
          <path d="M12 16c2 0 4 1 4 3" />
        </g>
      ) : (
        <g stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={isHealthy ? "#22c55e" : "none"}>
          <path d="M12 18c-2-2-4-2-4 0 0 2 2 2 4 0z">
            {isHealthy && <animateTransform attributeName="transform" type="rotate" values="0 12 18; -10 12 18; 0 12 18" dur="3s" repeatCount="indefinite" />}
          </path>
          <path d="M12 16c2-2 4-2 4 0 0 2-2 2-4 0z">
            {isHealthy && <animateTransform attributeName="transform" type="rotate" values="0 12 16; 10 12 16; 0 12 16" dur="3s" repeatCount="indefinite" />}
          </path>
        </g>
      )}
      <circle cx="12" cy="8" r="3" fill={isFlooded ? "#1e3a8a" : isDry ? "none" : "#f59e0b"} stroke={color} strokeWidth="2"/>
      <path d="M12 2v3M12 11v3M5 8h3M16 8h3M7.5 3.5l2 2M14.5 10.5l2 2M7.5 12.5l2-2M14.5 5.5l2-2" stroke={color} strokeWidth="1.5" strokeLinecap="round">
        {isHealthy && <animateTransform attributeName="transform" type="rotate" values="0 12 8; 360 12 8" dur="10s" repeatCount="indefinite" />}
      </path>
      {isFlooded && (
        <path d="M4 20h16" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round">
           <animate attributeName="d" values="M4 20h16; M4 18h16; M4 20h16" dur="2s" repeatCount="indefinite" />
        </path>
      )}
    </svg>
  );
};

const TankIcon = ({ level }: { level: 'empty' | 'half' | 'full' }) => {
  const color = level === 'empty' ? '#94a3b8' : level === 'half' ? '#3b82f6' : '#0d9488';
  
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 4v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 4h18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {level === 'half' && (
        <path fill="#3b82f6" opacity="0.5">
          <animate attributeName="d" 
            values="M5 14 Q 12 12 19 14 L 19 22 L 5 22 Z; M5 14 Q 12 16 19 14 L 19 22 L 5 22 Z; M5 14 Q 12 12 19 14 L 19 22 L 5 22 Z" 
            dur="2s" repeatCount="indefinite" />
        </path>
      )}
      {level === 'full' && (
        <path fill="#0d9488" opacity="0.5">
          <animate attributeName="d" 
            values="M5 6 Q 12 4 19 6 L 19 22 L 5 22 Z; M5 6 Q 12 8 19 6 L 19 22 L 5 22 Z; M5 6 Q 12 4 19 6 L 19 22 L 5 22 Z" 
            dur="2s" repeatCount="indefinite" />
        </path>
      )}
    </svg>
  );
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const Hardware = () => {
  const [components, setComponents] = useState([
    { id: 1, name: 'Main Pump', type: 'Pump', status: 'Online', bg: 'bg-blue-50', isOn: true, zone: 'Main System' },
    { id: 2, name: 'Zone 1 Valve', type: 'Valve', status: 'Online', bg: 'bg-indigo-50', isOn: false, zone: 'Zone 1' },
    { id: 3, name: 'Soil Sensor', type: 'Soil Sensor', status: 'Online', bg: 'bg-orange-50', value: 55, zone: 'Zone 1' },
    { id: 4, name: 'Primary Tank', type: 'Dual IR Sensor', status: 'Online', bg: 'bg-cyan-50', sensor10: true, sensor90: false, zone: 'Main System' },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newComp, setNewComp] = useState({ name: '', type: 'Pump', zone: 'Zone 1' });
  
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [editZoneName, setEditZoneName] = useState('');

  const groupedComponents = components.reduce((acc, comp) => {
    if (!acc[comp.zone]) acc[comp.zone] = [];
    acc[comp.zone].push(comp);
    return acc;
  }, {} as Record<string, typeof components[0][]>);

  const toggleComponent = (id: number) => {
    setComponents(components.map(comp => {
      if (comp.id === id && (comp.type === 'Pump' || comp.type === 'Valve')) {
        return { ...comp, isOn: !comp.isOn };
      }
      if (comp.id === id && comp.type === 'Dual IR Sensor') {
        if (!comp.sensor10 && !comp.sensor90) return { ...comp, sensor10: true, sensor90: false };
        if (comp.sensor10 && !comp.sensor90) return { ...comp, sensor10: true, sensor90: true };
        return { ...comp, sensor10: false, sensor90: false };
      }
      if (comp.id === id && comp.type === 'Soil Sensor') {
        let nextVal = 55;
        if (comp.value === 55) nextVal = 80;
        else if (comp.value === 80) nextVal = 30;
        return { ...comp, value: nextVal };
      }
      return comp;
    }));
  };

  const handleAddComponent = () => {
    if (!newComp.name || !newComp.zone) return;
    
    let bg = 'bg-slate-50';
    if (newComp.type === 'Pump') bg = 'bg-blue-50';
    if (newComp.type === 'Valve') bg = 'bg-indigo-50';
    if (newComp.type === 'Soil Sensor') bg = 'bg-orange-50';
    if (newComp.type === 'Dual IR Sensor') bg = 'bg-cyan-50';

    const newComponent: any = {
      id: Date.now(),
      name: newComp.name,
      type: newComp.type,
      status: 'Online',
      bg,
      zone: newComp.zone
    };

    if (newComp.type === 'Pump' || newComp.type === 'Valve') {
      newComponent.isOn = false;
    } else if (newComp.type === 'Soil Sensor') {
      newComponent.value = 50;
    } else if (newComp.type === 'Dual IR Sensor') {
      newComponent.sensor10 = false;
      newComponent.sensor90 = false;
    }

    setComponents([...components, newComponent]);
    setIsAddModalOpen(false);
    setNewComp({ name: '', type: 'Pump', zone: 'Zone 1' });
  };

  const openEditZone = (zone: string) => {
    setEditingZone(zone);
    setEditZoneName(zone);
  };

  const handleSaveZone = () => {
    if (!editZoneName || !editingZone) return;
    setComponents(components.map(comp => 
      comp.zone === editingZone ? { ...comp, zone: editZoneName } : comp
    ));
    setEditingZone(null);
  };

  const handleDeleteZone = () => {
    if (!editingZone) return;
    setComponents(components.filter(comp => comp.zone !== editingZone));
    setEditingZone(null);
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 relative z-10 pb-10"
    >
      <motion.div variants={item} className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Hardware Components</h2>
          <p className="text-sm text-slate-500 mt-1">Manage pumps, valves, and sensors</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#00a3ff] hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-300 hover:-translate-y-0.5 duration-200"
        >
          <Plus size={18} />
          Add Component
        </button>
      </motion.div>

      {Object.entries(groupedComponents).map(([zone, zoneComponents]) => (
        <div key={zone} className="mb-8">
          <div className="flex items-center gap-3 mb-4 group">
            <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
              <div className="w-1.5 h-5 bg-[#00a3ff] rounded-full"></div>
              {zone}
            </h3>
            <button 
              onClick={() => openEditZone(zone)}
              className="text-slate-400 hover:text-[#00a3ff] opacity-0 group-hover:opacity-100 transition-opacity p-1"
              title="Edit Zone"
            >
              <Edit2 size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {zoneComponents.map((comp) => {
              const isActuator = comp.type === 'Pump' || comp.type === 'Valve';
              
              let displayValue = comp.value ? `${comp.value}%` : '';
              let tankLevel: 'empty' | 'half' | 'full' = 'empty';
              
              if (comp.type === 'Dual IR Sensor') {
                if (comp.sensor10 && comp.sensor90) {
                  displayValue = 'Full (>90%)';
                  tankLevel = 'full';
                } else if (comp.sensor10 && !comp.sensor90) {
                  displayValue = 'Half-way full';
                  tankLevel = 'half';
                } else {
                  displayValue = 'Empty (<10%)';
                  tankLevel = 'empty';
                }
              }
              
              return (
                <motion.div variants={item} key={comp.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col hover:shadow-md hover:border-blue-100 transition-all duration-300 group">
                  <div className="flex justify-between items-start mb-3">
                    <div className={`${comp.bg} p-2.5 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                      {comp.type === 'Pump' && <PumpIcon isOn={comp.isOn!} />}
                      {comp.type === 'Valve' && <ValveIcon isOn={comp.isOn!} />}
                      {comp.type === 'Soil Sensor' && <FlowerIcon humidity={comp.value as number} />}
                      {comp.type === 'Dual IR Sensor' && <TankIcon level={tankLevel} />}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium">
                      <div className={`w-1.5 h-1.5 rounded-full ${comp.status === 'Online' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
                      <span className={comp.status === 'Online' ? 'text-emerald-600' : 'text-red-600'}>{comp.status}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-sm font-bold text-slate-800 mb-0.5 group-hover:text-[#00a3ff] transition-colors truncate" title={comp.name}>{comp.name}</h3>
                  <p className="text-xs text-slate-500 mb-3">{comp.type}</p>
                  
                  <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between min-h-[32px]">
                    {isActuator ? (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-semibold text-slate-600">{comp.isOn ? 'ON' : 'OFF'}</span>
                        <button 
                          onClick={() => toggleComponent(comp.id)}
                          className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${comp.isOn ? 'bg-emerald-400' : 'bg-slate-300'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform duration-300 ${comp.isOn ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                    ) : (
                      <div 
                        className={`flex items-center gap-2 w-full cursor-pointer hover:text-[#00a3ff] transition-colors`}
                        onClick={() => toggleComponent(comp.id)}
                        title="Click to simulate value change"
                      >
                        <Activity size={14} className={comp.type === 'Dual IR Sensor' ? 'text-cyan-500' : comp.type === 'Soil Sensor' ? 'text-orange-500' : 'text-slate-400'} />
                        <span className="text-xs font-bold text-slate-700 truncate">{displayValue}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Add Component Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Add Component</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Name</label>
                <input 
                  type="text" 
                  value={newComp.name} 
                  onChange={e => setNewComp({...newComp, name: e.target.value})} 
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-[#00a3ff] focus:ring-1 focus:ring-[#00a3ff]" 
                  placeholder="e.g. Secondary Pump" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Zone</label>
                <input 
                  type="text" 
                  value={newComp.zone} 
                  onChange={e => setNewComp({...newComp, zone: e.target.value})} 
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-[#00a3ff] focus:ring-1 focus:ring-[#00a3ff]" 
                  placeholder="e.g. Zone 2" 
                  list="zones-list" 
                />
                <datalist id="zones-list">
                  {Object.keys(groupedComponents).map(z => <option key={z} value={z} />)}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Type</label>
                <select 
                  value={newComp.type} 
                  onChange={e => setNewComp({...newComp, type: e.target.value})} 
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-[#00a3ff] focus:ring-1 focus:ring-[#00a3ff]"
                >
                  <option value="Pump">Pump</option>
                  <option value="Valve">Valve</option>
                  <option value="Soil Sensor">Soil Sensor</option>
                  <option value="Dual IR Sensor">Dual IR Sensor</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddComponent} 
                className="bg-[#00a3ff] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!newComp.name || !newComp.zone}
              >
                Add Component
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Zone Modal */}
      {editingZone && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Edit Zone</h3>
              <button onClick={() => setEditingZone(null)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Zone Name</label>
              <input 
                type="text" 
                value={editZoneName} 
                onChange={e => setEditZoneName(e.target.value)} 
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-[#00a3ff] focus:ring-1 focus:ring-[#00a3ff]" 
              />
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <button 
                onClick={handleDeleteZone} 
                className="text-red-500 hover:text-red-600 flex items-center gap-1 text-sm font-semibold transition-colors"
              >
                <Trash2 size={16} /> Delete Zone
              </button>
              <div className="flex gap-3">
                <button 
                  onClick={() => setEditingZone(null)} 
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveZone} 
                  className="bg-[#00a3ff] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
                  disabled={!editZoneName.trim()}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Hardware;
