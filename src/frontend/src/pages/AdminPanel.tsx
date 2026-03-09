// File: src/frontend/src/pages/AdminPanel.tsx
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit2, Trash2, Shield, Eye, X } from 'lucide-react';

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

type Role = 'admin' | 'view_only';

interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}

const AdminPanel = () => {
  const [users, setUsers] = useState<UserData[]>([
    { id: 1, firstName: 'Admin', lastName: 'User', email: 'admin@hydroflow.com', role: 'admin' },
    { id: 2, firstName: 'Guest', lastName: 'Viewer', email: 'guest@hydroflow.com', role: 'view_only' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', role: 'view_only' as Role });

  const handleOpenModal = (user?: UserData) => {
    if (user) {
      setEditingUser(user);
      setFormData({ firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role });
    } else {
      setEditingUser(null);
      setFormData({ firstName: '', lastName: '', email: '', role: 'view_only' });
    }
    setIsModalOpen(true);
  };

  const handleSaveUser = () => {
    if (!formData.firstName || !formData.lastName || !formData.email) return;

    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
    } else {
      setUsers([...users, { id: Date.now(), ...formData }]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteUser = (id: number) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const getInitials = (first: string, last: string) => {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
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
          <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
          <p className="text-sm text-slate-500 mt-1">Manage system access and roles</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#00a3ff] hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-300 hover:-translate-y-0.5 duration-200"
        >
          <Plus size={18} />
          Add User
        </button>
      </motion.div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <motion.tr variants={item} key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-bold shadow-sm border border-blue-200/50">
                        {getInitials(user.firstName, user.lastName)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{user.firstName} {user.lastName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {user.role === 'admin' ? <Shield size={14} /> : <Eye size={14} />}
                      {user.role === 'admin' ? 'Admin' : 'View Only'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(user)}
                        className="p-2 text-slate-400 hover:text-[#00a3ff] hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">{editingUser ? 'Edit User' : 'Add User'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">First Name</label>
                  <input 
                    type="text" 
                    value={formData.firstName} 
                    onChange={e => setFormData({...formData, firstName: e.target.value})} 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-[#00a3ff] focus:ring-1 focus:ring-[#00a3ff]" 
                    placeholder="John" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Last Name</label>
                  <input 
                    type="text" 
                    value={formData.lastName} 
                    onChange={e => setFormData({...formData, lastName: e.target.value})} 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-[#00a3ff] focus:ring-1 focus:ring-[#00a3ff]" 
                    placeholder="Doe" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-[#00a3ff] focus:ring-1 focus:ring-[#00a3ff]" 
                  placeholder="john@example.com" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Role</label>
                <select 
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value as Role})} 
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-[#00a3ff] focus:ring-1 focus:ring-[#00a3ff]"
                >
                  <option value="admin">Admin (Full Rights)</option>
                  <option value="view_only">View Only</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">
                  {formData.role === 'admin' 
                    ? 'Admins have full access to edit hardware, zones, and system settings.' 
                    : 'View Only users can view the dashboard and hardware status, but cannot make any changes.'}
                </p>
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
                onClick={handleSaveUser} 
                className="bg-[#00a3ff] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!formData.firstName || !formData.lastName || !formData.email}
              >
                {editingUser ? 'Save Changes' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminPanel;
