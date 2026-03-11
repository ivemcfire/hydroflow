// File: src/frontend/src/pages/Zones.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link as LinkIcon, X, Map as MapIcon } from 'lucide-react';

const ConnectionsOverlay = ({ connections, onDelete }: { connections: any[], onDelete: (id: string) => void }) => {
  const [lines, setLines] = useState<any[]>([]);

  useEffect(() => {
    const updateLines = () => {
      const container = document.getElementById('zones-container');
      if (!container) return;
      const containerRect = container.getBoundingClientRect();

      const newLines = connections.map(conn => {
        const el1 = document.getElementById(`zone-${conn.from}`);
        const el2 = document.getElementById(`zone-${conn.to}`);
        
        if (el1 && el2) {
          const rect1 = el1.getBoundingClientRect();
          const rect2 = el2.getBoundingClientRect();
          
          const x1 = rect1.left + rect1.width / 2 - containerRect.left;
          const y1 = rect1.top + rect1.height / 2 - containerRect.top;
          const x2 = rect2.left + rect2.width / 2 - containerRect.left;
          const y2 = rect2.top + rect2.height / 2 - containerRect.top;
          
          return {
            id: conn.id,
            x1, y1, x2, y2,
            midX: (x1 + x2) / 2,
            midY: (y1 + y2) / 2
          };
        }
        return null;
      }).filter(Boolean);
      
      setLines(newLines);
    };

    const timeoutId = setTimeout(updateLines, 100);
    window.addEventListener('resize', updateLines);
    
    const observer = new MutationObserver(updateLines);
    const container = document.getElementById('zones-container');
    if (container) {
      observer.observe(container, { childList: true, subtree: true, attributes: true });
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateLines);
      observer.disconnect();
    };
  }, [connections]);

  return (
    <svg className="absolute inset-0 pointer-events-none z-0" style={{ width: '100%', height: '100%' }}>
      {lines.map((line: any) => (
        <g key={line.id}>
          <line 
            x1={line.x1} 
            y1={line.y1} 
            x2={line.x2} 
            y2={line.y2} 
            stroke="#00a3ff" 
            strokeWidth="3" 
            strokeDasharray="6 6"
            className="opacity-50"
          />
          <circle cx={line.x1} cy={line.y1} r="6" fill="#00a3ff" className="opacity-80" />
          <circle cx={line.x2} cy={line.y2} r="6" fill="#00a3ff" className="opacity-80" />
          
          {/* Delete Connection Button */}
          <g 
            className="pointer-events-auto cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onDelete(line.id)}
            transform={`translate(${line.midX}, ${line.midY})`}
          >
            <circle cx="0" cy="0" r="12" fill="white" stroke="#ef4444" strokeWidth="2" />
            <path d="M-4 -4 L4 4 M4 -4 L-4 4" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
          </g>
        </g>
      ))}
    </svg>
  );
};

const Zones = () => {
  const [zones] = useState([
    { id: 'z1', name: 'Main Reservoir', type: 'Source', status: 'Active' },
    { id: 'z2', name: 'Greenhouse A', type: 'Irrigation', status: 'Active' },
    { id: 'z3', name: 'Outdoor Garden', type: 'Irrigation', status: 'Standby' },
    { id: 'z4', name: 'Nursery', type: 'Irrigation', status: 'Active' },
  ]);

  const [connections, setConnections] = useState([
    { id: 'c1', from: 'z1', to: 'z2' },
    { id: 'c2', from: 'z1', to: 'z3' },
  ]);

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [newConnection, setNewConnection] = useState({ from: '', to: '' });

  const handleDeleteConnection = (id: string) => {
    setConnections(connections.filter(c => c.id !== id));
  };

  const handleAddConnection = () => {
    if (!newConnection.from || !newConnection.to || newConnection.from === newConnection.to) return;
    
    const exists = connections.some(
      c => (c.from === newConnection.from && c.to === newConnection.to) || 
           (c.from === newConnection.to && c.to === newConnection.from)
    );
    
    if (!exists) {
      setConnections([...connections, { 
        id: `c_${Date.now()}`, 
        from: newConnection.from, 
        to: newConnection.to 
      }]);
    }
    
    setIsConnectModalOpen(false);
    setNewConnection({ from: '', to: '' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 relative z-10 pb-10"
    >
      <div className="flex justify-between items-center mb-8 relative z-20">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <MapIcon className="text-[#00a3ff]" />
            Zone Map
          </h2>
          <p className="text-sm text-slate-500 mt-1">Visualize and manage logical connections between zones</p>
        </div>
        <button 
          onClick={() => setIsConnectModalOpen(true)}
          className="bg-[#00a3ff] hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-300 hover:-translate-y-0.5 duration-200"
        >
          <LinkIcon size={18} />
          <span className="hidden sm:inline">Connect Zones</span>
        </button>
      </div>

      <div id="zones-container" className="relative min-h-[400px] bg-white/40 rounded-3xl p-8 border border-slate-200/60 shadow-inner">
        <ConnectionsOverlay connections={connections} onDelete={handleDeleteConnection} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 relative z-10">
          {zones.map(zone => (
            <div 
              key={zone.id} 
              id={`zone-${zone.id}`}
              className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-inner ${zone.type === 'Source' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                <MapIcon size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">{zone.name}</h3>
              <p className="text-sm text-slate-500 font-medium mb-3">{zone.type}</p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-xs font-semibold">
                <div className={`w-2 h-2 rounded-full ${zone.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                <span className="text-slate-600">{zone.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connect Modal */}
      <AnimatePresence>
        {isConnectModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <LinkIcon size={20} className="text-[#00a3ff]" /> Connect Zones
                </h3>
                <button onClick={() => setIsConnectModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">From Zone</label>
                  <select 
                    value={newConnection.from} 
                    onChange={e => setNewConnection({...newConnection, from: e.target.value})} 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-[#00a3ff] focus:ring-1 focus:ring-[#00a3ff]"
                  >
                    <option value="">Select source zone...</option>
                    {zones.map(z => (
                      <option key={z.id} value={z.id} disabled={z.id === newConnection.to}>{z.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex justify-center">
                  <div className="bg-slate-100 p-2 rounded-full text-slate-400">
                    <LinkIcon size={16} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">To Zone</label>
                  <select 
                    value={newConnection.to} 
                    onChange={e => setNewConnection({...newConnection, to: e.target.value})} 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-[#00a3ff] focus:ring-1 focus:ring-[#00a3ff]"
                  >
                    <option value="">Select target zone...</option>
                    {zones.map(z => (
                      <option key={z.id} value={z.id} disabled={z.id === newConnection.from}>{z.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                <button 
                  onClick={() => setIsConnectModalOpen(false)} 
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddConnection} 
                  className="bg-[#00a3ff] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!newConnection.from || !newConnection.to || newConnection.from === newConnection.to}
                >
                  Create Connection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Zones;
