// File: src/frontend/src/pages/Schedule.tsx
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, Plus, Trash2, Edit2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import HardwareIcon from '../components/HardwareIcon';

interface ScheduleItem {
  id: string;
  type: 'hardware' | 'automation';
  target: string;
  action: string;
  time: string;
  days: string[];
  status: 'active' | 'inactive';
}

const mockSchedules: ScheduleItem[] = [
  { id: '1', type: 'hardware', target: 'Main Pump', action: 'Turn On', time: '08:00', days: ['Mon', 'Wed', 'Fri'], status: 'active' },
  { id: '2', type: 'hardware', target: 'Main Pump', action: 'Turn Off', time: '10:00', days: ['Mon', 'Wed', 'Fri'], status: 'active' },
  { id: '3', type: 'automation', target: 'Night Mode', action: 'Trigger', time: '22:00', days: ['Everyday'], status: 'active' },
];

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const hardwareTargets = ['Main Pump', 'Fertilizer Injector', 'Zone 1 Valve', 'Zone 2 Valve'];

const Schedule = () => {
  const { state } = useAppContext();
  const { automations } = state;

  const getTargetType = (target: string): 'hardware' | 'automation' => {
    return hardwareTargets.includes(target) ? 'hardware' : 'automation';
  };

  const getIconType = (target: string): string => {
    if (target.includes('Pump') || target.includes('Injector')) return 'Pump';
    if (target.includes('Valve')) return 'Valve';
    return 'Automation';
  };

  const [schedules, setSchedules] = useState<ScheduleItem[]>(mockSchedules);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [newTarget, setNewTarget] = useState('');
  const [newAction, setNewAction] = useState('');
  const [newTime, setNewTime] = useState('12:00');
  const [newDays, setNewDays] = useState<string[]>([]);

  const toggleDay = (day: string) => {
    if (newDays.includes(day)) {
      setNewDays(newDays.filter(d => d !== day));
    } else {
      setNewDays([...newDays, day]);
    }
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTarget || !newAction || newDays.length === 0) return;
    
    const type = getTargetType(newTarget);
    const finalDays = newDays.length === 7 ? ['Everyday'] : newDays;

    if (editingId) {
      setSchedules(schedules.map(s => s.id === editingId ? {
        ...s,
        type,
        target: newTarget,
        action: newAction,
        time: newTime,
        days: finalDays
      } : s));
    } else {
      const newItem: ScheduleItem = {
        id: Date.now().toString(),
        type,
        target: newTarget,
        action: newAction,
        time: newTime,
        days: finalDays,
        status: 'active'
      };
      setSchedules([...schedules, newItem]);
    }
    
    handleCancel();
  };

  const handleEdit = (schedule: ScheduleItem) => {
    setEditingId(schedule.id);
    setNewTarget(schedule.target);
    setNewAction(schedule.action);
    setNewTime(schedule.time);
    setNewDays(schedule.days.includes('Everyday') ? DAYS_OF_WEEK : schedule.days);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewTarget('');
    setNewAction('');
    setNewDays([]);
  };

  const toggleStatus = (id: string) => {
    setSchedules(schedules.map(s => 
      s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s
    ));
  };

  const deleteSchedule = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Schedule Management</h1>
          <p className="text-slate-500 text-sm mt-1">Automate your hardware and rules based on time.</p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setEditingId(null); setNewTarget(''); setNewAction(''); setNewDays([]); }}
          className="flex items-center gap-2 bg-[#00a3ff] hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold transition-colors shadow-sm shadow-blue-200"
        >
          <Plus size={18} />
          New Schedule
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">{editingId ? 'Edit Schedule' : 'Create New Schedule'}</h2>
            <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600">
              <Trash2 size={20} />
            </button>
          </div>
          
          <form onSubmit={handleAddSchedule} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target</label>
                <select 
                  value={newTarget}
                  onChange={(e) => {
                    setNewTarget(e.target.value);
                    setNewAction('');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00a3ff]/50 focus:border-[#00a3ff]"
                  required
                >
                  <option value="">Select Target...</option>
                  <optgroup label="Hardware">
                    {hardwareTargets.map(t => <option key={t} value={t}>{t}</option>)}
                  </optgroup>
                  <optgroup label="Automation Rules">
                    {automations.map(a => <option key={`auto-${a.id}`} value={`Rule ${a.id}: ${a.condition}`}>Rule {a.id}: {a.condition}</option>)}
                  </optgroup>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Action</label>
                <select 
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00a3ff]/50 focus:border-[#00a3ff]"
                  required
                  disabled={!newTarget}
                >
                  <option value="">Select Action...</option>
                  {newTarget && getTargetType(newTarget) === 'hardware' ? (
                    <>
                      <option value="Turn On">Turn On</option>
                      <option value="Turn Off">Turn Off</option>
                      <option value="Toggle">Toggle</option>
                    </>
                  ) : newTarget && getTargetType(newTarget) === 'automation' ? (
                    <>
                      <option value="Trigger">Trigger</option>
                      <option value="Enable">Enable</option>
                      <option value="Disable">Disable</option>
                    </>
                  ) : null}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Time</label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="time" 
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00a3ff]/50 focus:border-[#00a3ff]"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Days of Week</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        newDays.includes(day) 
                          ? 'bg-[#00a3ff] text-white shadow-sm shadow-blue-200' 
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {day.charAt(0)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={!newTarget || !newAction || newDays.length === 0}
                className="px-4 py-2 text-sm font-semibold bg-[#00a3ff] hover:bg-blue-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingId ? 'Update Schedule' : 'Save Schedule'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {schedules.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200/60 border-dashed">
            <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-lg font-medium text-slate-900">No schedules found</h3>
            <p className="text-slate-500 mt-1">Create a new schedule to automate your system.</p>
          </div>
        ) : (
          schedules.map((schedule) => (
            <motion.div 
              key={schedule.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`bg-white rounded-2xl p-5 border transition-all ${schedule.status === 'active' ? 'border-slate-200/60 shadow-sm' : 'border-slate-200/40 opacity-70'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${schedule.status === 'active' ? 'bg-blue-50 text-[#00a3ff]' : 'bg-slate-50 text-slate-400'}`}>
                    <HardwareIcon type={getIconType(schedule.target)} className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{schedule.target}</h3>
                    <p className="text-xs font-semibold text-slate-500">{schedule.action}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleStatus(schedule.id)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${schedule.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${schedule.status === 'active' ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm font-medium text-slate-600 bg-slate-50 p-3 rounded-xl">
                <div className="flex items-center gap-1.5">
                  <Clock size={16} className="text-slate-400" />
                  {schedule.time}
                </div>
                <div className="w-px h-4 bg-slate-200"></div>
                <div className="flex items-center gap-1.5 truncate">
                  <Calendar size={16} className="text-slate-400 shrink-0" />
                  <span className="truncate">{schedule.days.join(', ')}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button 
                  onClick={() => handleEdit(schedule)}
                  className="text-slate-400 hover:text-[#00a3ff] transition-colors p-1"
                  title="Edit Schedule"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => deleteSchedule(schedule.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  title="Delete Schedule"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Schedule;
