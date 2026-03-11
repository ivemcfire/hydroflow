// File: src/frontend/src/pages/Automation.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, ArrowRight, Plus, Trash2, Activity, Settings2, X, Edit2, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import HardwareIcon from '../components/HardwareIcon';

const Automation = () => {
  const { state, dispatch } = useAppContext();
  const { automations } = state;

  const [components] = useState([
    { id: 1, name: 'Main Pump', type: 'Pump' },
    { id: 2, name: 'Zone 1 Valve', type: 'Valve' },
    { id: 3, name: 'Soil Sensor', type: 'Soil Sensor' },
    { id: 4, name: 'Primary Tank', type: 'Dual IR Sensor' },
    { id: 5, name: 'Secondary Pump', type: 'Pump' },
    { id: 6, name: 'Zone 2 Valve', type: 'Valve' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  const [newRule, setNewRule] = useState<{ sourceId: string, condition: string, targets: {id: string, action: string}[] }>({ sourceId: '', condition: '', targets: [] });

  const handleDelete = (id: number) => {
    dispatch({ type: 'DELETE_AUTOMATION', payload: id });
  };

  const handleToggleStatus = (id: number) => {
    const rule = automations.find(a => a.id === id);
    if (rule) {
      dispatch({ 
        type: 'UPDATE_AUTOMATION', 
        payload: { ...rule, status: rule.status === 'Active' ? 'Paused' : 'Active' } 
      });
    }
  };

  const openEditModal = (rule: any) => {
    setEditingRuleId(rule.id);
    setNewRule({
      sourceId: rule.sourceId.toString(),
      condition: rule.condition,
      targets: rule.targets.map((t: any) => ({ id: t.id.toString(), action: t.action }))
    });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingRuleId(null);
    setNewRule({ sourceId: '', condition: '', targets: [] });
    setIsModalOpen(true);
  };

  const handleSaveRule = () => {
    if (!newRule.sourceId || !newRule.condition || newRule.targets.length === 0) return;
    
    if (editingRuleId) {
      const existingRule = automations.find(a => a.id === editingRuleId);
      if (existingRule) {
        dispatch({
          type: 'UPDATE_AUTOMATION',
          payload: {
            ...existingRule,
            sourceId: Number(newRule.sourceId),
            targets: newRule.targets.map(t => ({ id: Number(t.id), action: t.action })),
            condition: newRule.condition
          }
        });
      }
    } else {
      dispatch({
        type: 'ADD_AUTOMATION',
        payload: {
          id: Date.now(),
          sourceId: Number(newRule.sourceId),
          targets: newRule.targets.map(t => ({ id: Number(t.id), action: t.action })),
          condition: newRule.condition,
          status: 'Active'
        }
      });
    }
    
    setIsModalOpen(false);
    setEditingRuleId(null);
    setNewRule({ sourceId: '', condition: '', targets: [] });
  };

  const toggleTarget = (id: string) => {
    if (newRule.targets.some(t => t.id === id)) {
      setNewRule({ ...newRule, targets: newRule.targets.filter(t => t.id !== id) });
    } else {
      setNewRule({ ...newRule, targets: [...newRule.targets, { id, action: 'Turn On' }] });
    }
  };

  const updateTargetAction = (id: string, action: string) => {
    setNewRule({
      ...newRule,
      targets: newRule.targets.map(t => t.id === id ? { ...t, action } : t)
    });
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
            <Settings2 className="text-[#00a3ff]" />
            Automation Rules
          </h2>
          <p className="text-sm text-slate-500 mt-1">Configure triggers and actions between hardware components</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-[#00a3ff] hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-300 hover:-translate-y-0.5 duration-200"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Create Rule</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {automations.map(rule => {
            const source = components.find(c => c.id === rule.sourceId);
            
            if (!source || rule.targets.length === 0) return null;

            return (
              <motion.div 
                key={rule.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98, height: 0, marginBottom: 0 }}
                className={`bg-white rounded-2xl p-4 shadow-sm border transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${rule.status === 'Active' ? 'border-slate-200 hover:border-blue-200 hover:shadow-md' : 'border-slate-100 opacity-60'}`}
              >
                {/* Left side: Source + Arrow + Targets */}
                <div className="flex-1 flex flex-wrap items-center gap-3 w-full">
                  {/* Source Square */}
                  <div className="w-24 h-24 flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-xl p-2 shrink-0 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 opacity-80"></div>
                    <HardwareIcon type={source.type} className="text-blue-500 mb-1 w-[18px] h-[18px]" />
                    <span className="text-xs font-bold text-slate-700 text-center line-clamp-2 leading-tight w-full">{source.name}</span>
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded mt-auto w-full text-center truncate" title={rule.condition}>
                      {rule.condition}
                    </span>
                  </div>

                  {/* Arrow */}
                  <div className={`flex items-center justify-center shrink-0 ${rule.status === 'Active' ? 'text-emerald-500' : 'text-slate-300'}`}>
                    <ArrowRight size={20} />
                  </div>

                  {/* Target Squares */}
                  <div className="flex flex-wrap gap-2 flex-1">
                    {rule.targets.map(targetInfo => {
                      const targetComp = components.find(c => c.id === targetInfo.id);
                      if (!targetComp) return null;
                      
                      let colorTheme = {
                        bar: 'bg-slate-400',
                        icon: 'text-slate-500',
                        badgeText: 'text-slate-700',
                        badgeBg: 'bg-slate-100',
                        badgeBorder: 'border-slate-200'
                      };
                      
                      if (targetInfo.action === 'Turn On') {
                        colorTheme = {
                          bar: 'bg-sky-400',
                          icon: 'text-sky-500',
                          badgeText: 'text-sky-700',
                          badgeBg: 'bg-sky-100',
                          badgeBorder: 'border-sky-200'
                        };
                      } else if (targetInfo.action === 'Toggle') {
                        colorTheme = {
                          bar: 'bg-indigo-600',
                          icon: 'text-indigo-600',
                          badgeText: 'text-indigo-800',
                          badgeBg: 'bg-indigo-100',
                          badgeBorder: 'border-indigo-200'
                        };
                      }

                      return (
                        <div key={targetComp.id} className="w-24 h-24 flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-xl p-2 shrink-0 relative overflow-hidden group">
                          <div className={`absolute top-0 left-0 w-full h-1 ${colorTheme.bar} opacity-80`}></div>
                          <HardwareIcon type={targetComp.type} className={`${colorTheme.icon} mb-1 w-[18px] h-[18px]`} />
                          <span className="text-xs font-bold text-slate-700 text-center line-clamp-2 leading-tight w-full">{targetComp.name}</span>
                          <span className={`text-[10px] font-semibold ${colorTheme.badgeText} ${colorTheme.badgeBg} border ${colorTheme.badgeBorder} px-1.5 py-0.5 rounded mt-auto w-full text-center truncate`} title={targetInfo.action}>
                            {targetInfo.action}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex sm:flex-col items-center justify-end gap-2 shrink-0 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-3 w-full sm:w-auto">
                  <button 
                    onClick={() => handleToggleStatus(rule.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold w-full sm:w-24 transition-colors ${rule.status === 'Active' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    {rule.status}
                  </button>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => openEditModal(rule)}
                      className="p-2 text-slate-400 hover:text-[#00a3ff] hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Rule"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(rule.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Rule"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {automations.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 border-dashed">
            <Zap size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-1">No Automation Rules</h3>
            <p className="text-sm text-slate-500">Create rules to automate your hardware components.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Rule Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Zap size={20} className="text-[#00a3ff]" /> {editingRuleId ? 'Edit Automation Rule' : 'Create Automation Rule'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* IF Section */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded">IF</span> Trigger
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Component</label>
                      <select 
                        value={newRule.sourceId} 
                        onChange={e => setNewRule({...newRule, sourceId: e.target.value})} 
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#00a3ff] focus:ring-1 focus:ring-[#00a3ff]"
                      >
                        <option value="">Select source...</option>
                        {components.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Condition</label>
                      <input 
                        type="text" 
                        value={newRule.condition} 
                        onChange={e => setNewRule({...newRule, condition: e.target.value})} 
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#00a3ff] focus:ring-1 focus:ring-[#00a3ff]" 
                        placeholder="e.g. Value < 40%" 
                      />
                    </div>
                  </div>
                </div>

                {/* THEN Section */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <span className="bg-[#00a3ff] text-white px-2 py-0.5 rounded">THEN</span> Action
                  </h4>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Target Components & Actions</label>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                      {components.map(c => {
                        if (c.id.toString() === newRule.sourceId) return null;
                        const target = newRule.targets.find(t => t.id === c.id.toString());
                        const isSelected = !!target;
                        
                        return (
                          <div 
                            key={c.id}
                            className={`border rounded-lg px-3 py-2.5 text-sm flex items-center justify-between transition-all ${isSelected ? 'border-[#00a3ff] bg-blue-50 shadow-sm' : 'border-slate-200 hover:border-slate-300 hover:bg-white'}`}
                          >
                            <div 
                              className="flex items-center gap-3 cursor-pointer flex-1"
                              onClick={() => toggleTarget(c.id.toString())}
                            >
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'border-[#00a3ff] bg-[#00a3ff]' : 'border-slate-300'}`}>
                                {isSelected && <Check size={10} className="text-white" />}
                              </div>
                              <span className={`truncate font-medium ${isSelected ? 'text-blue-700' : 'text-slate-600'}`}>{c.name}</span>
                            </div>
                            
                            {isSelected && (
                              <select 
                                value={target.action} 
                                onChange={e => updateTargetAction(c.id.toString(), e.target.value)} 
                                className="ml-2 border border-blue-200 rounded-md px-2 py-1 text-xs font-semibold text-blue-700 bg-white focus:outline-none focus:border-[#00a3ff] focus:ring-1 focus:ring-[#00a3ff]"
                              >
                                <option value="Turn On">Turn On</option>
                                <option value="Turn Off">Turn Off</option>
                                <option value="Toggle">Toggle</option>
                              </select>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveRule} 
                  className="bg-[#00a3ff] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!newRule.sourceId || !newRule.condition || newRule.targets.length === 0}
                >
                  {editingRuleId ? 'Save Changes' : 'Create Rule'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Automation;
