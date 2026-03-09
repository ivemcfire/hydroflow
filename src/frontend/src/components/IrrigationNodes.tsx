// File: src/frontend/src/components/IrrigationNodes.tsx
import React, { useState } from 'react';
import { Plus, MapPin, Network, Edit2, X, Trash2, Cpu } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const NodeCard = ({ node, onEdit, isAdmin }: any) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md hover:border-blue-100 transition-all duration-300 group relative">
    {isAdmin && (
      <button 
        onClick={() => onEdit(node)}
        className="absolute top-4 right-4 bg-white p-2 rounded-xl text-slate-400 hover:text-[#00a3ff] shadow-sm border border-slate-100 group-hover:border-blue-100 transition-all z-10"
      >
        <Edit2 size={16} />
      </button>
    )}
    <div className="flex justify-between items-start mb-6 pr-10">
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-[#00a3ff] transition-colors">{node.name}</h3>
        <div className="flex items-center gap-1.5 text-slate-500 text-sm">
          <MapPin size={16} />
          <span>{node.location}</span>
        </div>
      </div>
      <div className="bg-[#f0f7fa] p-2.5 rounded-xl text-[#00a3ff] group-hover:scale-110 group-hover:bg-[#00a3ff] group-hover:text-white transition-all duration-300">
        <Network size={24} />
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-4 mb-6 flex-grow">
      <div className="bg-[#f8fafc] rounded-xl p-4 group-hover:bg-blue-50/50 transition-colors">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Components</p>
        <p className="text-2xl font-bold text-slate-800">{node.hardware?.length || 0}</p>
      </div>
      <div className="bg-[#f8fafc] rounded-xl p-4 group-hover:bg-blue-50/50 transition-colors">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Rules</p>
        <p className="text-2xl font-bold text-slate-800">{node.rules}</p>
      </div>
    </div>
    
    <div className="flex justify-between items-center text-xs text-slate-400 mt-auto pt-4 border-t border-slate-50">
      <div className="flex items-center gap-1.5">
        <div className={`w-2 h-2 rounded-full ${node.status === 'Online' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
        <span>{node.status}</span>
      </div>
      <span>Updated {node.time}</span>
    </div>
  </div>
);

const IrrigationNodes = () => {
  const { state } = useAppContext();
  const isAdmin = state.currentUser?.role === 'admin';

  const [nodes, setNodes] = useState([
    { id: 1, name: 'North Garden', location: 'Backyard North', hardware: ['Main Pump', 'Zone 1 Valve', 'Soil Sensor', 'Tank Sensor'], rules: 1, status: 'Online', time: '9:58 AM' },
    { id: 2, name: 'South Greenhouse', location: 'Greenhouse Area', hardware: ['Zone 2 Valve', 'Temp Sensor'], rules: 0, status: 'Online', time: '9:58 AM' },
  ]);

  const [editingNode, setEditingNode] = useState<any>(null);
  const [isNewNode, setIsNewNode] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [rules, setRules] = useState<any[]>([
    { id: 1, nodeId: 1, sensor: 'Soil Moisture', condition: '<', threshold: '30', action: 'Turn On', component: 'Main Pump' }
  ]);

  const handleEdit = (node: any) => {
    if (!isAdmin) return;
    setEditingNode({ ...node });
    setIsNewNode(false);
    setActiveTab('details');
  };

  const handleAddNode = () => {
    if (!isAdmin) return;
    setEditingNode({
      id: Date.now(),
      name: 'New Node',
      location: 'Unassigned',
      hardware: [],
      rules: 0,
      status: 'Offline',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    setIsNewNode(true);
    setActiveTab('details');
  };

  const closeEdit = () => {
    setEditingNode(null);
  };

  const saveNode = () => {
    if (isNewNode) {
      setNodes([...nodes, editingNode]);
    } else {
      setNodes(nodes.map(n => n.id === editingNode.id ? editingNode : n));
    }
    setEditingNode(null);
  };

  const addHardware = (comp: string) => {
    setEditingNode({ ...editingNode, hardware: [...(editingNode.hardware || []), comp] });
  };

  const removeHardware = (comp: string) => {
    setEditingNode({ ...editingNode, hardware: editingNode.hardware.filter((h: string) => h !== comp) });
  };

  const addRule = () => {
    const newRule = {
      id: Date.now(),
      nodeId: editingNode.id,
      sensor: 'Soil Moisture',
      condition: '<',
      threshold: '50',
      action: 'Turn On',
      component: 'Main Pump'
    };
    setRules([...rules, newRule]);
    setEditingNode({ ...editingNode, rules: editingNode.rules + 1 });
  };

  const removeRule = (ruleId: number) => {
    setRules(rules.filter(r => r.id !== ruleId));
    setEditingNode({ ...editingNode, rules: Math.max(0, editingNode.rules - 1) });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Irrigation Nodes</h2>
        {isAdmin && (
          <button 
            onClick={handleAddNode}
            className="bg-[#0f172a] hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-200"
          >
            <Plus size={18} />
            Add Node
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {nodes.map((node) => (
          <NodeCard key={node.id} node={node} onEdit={handleEdit} isAdmin={isAdmin} />
        ))}
      </div>

      {/* Edit Modal */}
      {editingNode && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{isNewNode ? 'Add New Node' : `Edit Node: ${editingNode.name}`}</h3>
                <p className="text-xs text-slate-500">{editingNode.location}</p>
              </div>
              <button onClick={closeEdit} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex border-b border-slate-100 px-6 pt-2 gap-6">
              <button 
                onClick={() => setActiveTab('details')}
                className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'details' ? 'border-[#00a3ff] text-[#00a3ff]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Details
              </button>
              <button 
                onClick={() => setActiveTab('hardware')}
                className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'hardware' ? 'border-[#00a3ff] text-[#00a3ff]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Hardware
              </button>
              <button 
                onClick={() => setActiveTab('automation')}
                className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'automation' ? 'border-[#00a3ff] text-[#00a3ff]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Automation Rules
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow">
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Node Name</label>
                    <input 
                      type="text" 
                      value={editingNode.name} 
                      onChange={(e) => setEditingNode({...editingNode, name: e.target.value})}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-[#00a3ff] focus:ring-1 focus:ring-[#00a3ff]" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Location</label>
                    <input 
                      type="text" 
                      value={editingNode.location} 
                      onChange={(e) => setEditingNode({...editingNode, location: e.target.value})}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-[#00a3ff] focus:ring-1 focus:ring-[#00a3ff]" 
                    />
                  </div>
                </div>
              )}

              {activeTab === 'hardware' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-slate-800">Assigned Components</h4>
                  </div>
                  
                  <div className="space-y-3">
                    {(editingNode.hardware || []).map((comp: string, idx: number) => (
                      <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="bg-white p-2 rounded-lg shadow-sm">
                            <Cpu size={16} className="text-[#00a3ff]" />
                          </div>
                          <span className="text-sm font-medium text-slate-700">{comp}</span>
                        </div>
                        <button onClick={() => removeHardware(comp)} className="text-slate-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    
                    {(!editingNode.hardware || editingNode.hardware.length === 0) && (
                      <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-sm text-slate-500">No hardware components assigned.</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex gap-3">
                    <select id="new-hardware-select" className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#00a3ff] focus:ring-1 focus:ring-[#00a3ff]">
                      <option value="">Select component to add...</option>
                      <option value="Main Water Pump">Main Water Pump</option>
                      <option value="Zone 1 Valve">Zone 1 Valve</option>
                      <option value="Zone 2 Valve">Zone 2 Valve</option>
                      <option value="Greenhouse Soil Sensor">Greenhouse Soil Sensor</option>
                      <option value="Primary Tank Sensor">Primary Tank Sensor</option>
                      <option value="Weather Station">Weather Station</option>
                    </select>
                    <button 
                      onClick={() => {
                        const select = document.getElementById('new-hardware-select') as HTMLSelectElement;
                        if (select.value && !(editingNode.hardware || []).includes(select.value)) {
                          addHardware(select.value);
                          select.value = '';
                        }
                      }}
                      className="bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'automation' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-slate-800">Active Rules</h4>
                    <button onClick={addRule} className="text-sm text-[#00a3ff] font-semibold flex items-center gap-1 hover:text-blue-600">
                      <Plus size={16} /> Add Rule
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {rules.filter(r => r.nodeId === editingNode.id).map(rule => (
                      <div key={rule.id} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between group">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded shadow-sm">IF</span>
                          <select className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white" defaultValue={rule.sensor}>
                            <option>Soil Moisture</option>
                            <option>Temperature</option>
                            <option>Tank Level</option>
                          </select>
                          <select className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white" defaultValue={rule.condition}>
                            <option>&lt;</option>
                            <option>&gt;</option>
                            <option>=</option>
                          </select>
                          <input type="text" defaultValue={rule.threshold} className="w-16 text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white text-center" />
                          <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded shadow-sm">THEN</span>
                          <select className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white" defaultValue={rule.action}>
                            <option>Turn On</option>
                            <option>Turn Off</option>
                          </select>
                          <select className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white" defaultValue={rule.component}>
                            <option>Main Pump</option>
                            <option>Zone 1 Valve</option>
                          </select>
                        </div>
                        <button onClick={() => removeRule(rule.id)} className="text-slate-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    
                    {rules.filter(r => r.nodeId === editingNode.id).length === 0 && (
                      <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-sm text-slate-500">No automation rules configured for this node.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button onClick={closeEdit} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                Cancel
              </button>
              <button onClick={saveNode} className="bg-[#00a3ff] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors">
                {isNewNode ? 'Create Node' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IrrigationNodes;
