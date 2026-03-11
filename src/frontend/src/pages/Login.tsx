// File: src/frontend/src/pages/Login.tsx
import React from 'react';
import { Shield, Eye } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import AnimatedDroplet from '../components/AnimatedDroplet';

const Login = () => {
  const { dispatch } = useAppContext();

  const handleLogin = (role: 'admin' | 'view_only') => {
    const user = role === 'admin' 
      ? { name: 'Admin User', role: 'admin' as const, initials: 'AU', title: 'System Manager' }
      : { name: 'Guest Viewer', role: 'view_only' as const, initials: 'GV', title: 'Observer' };
      
    dispatch({ type: 'SET_USER', payload: user });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7fa] to-[#e0f2fe] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div 
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl"
      />
      <div 
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-300/20 rounded-full blur-3xl"
      />

      <div 
        className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-xl border border-white/50 w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div 
            className="bg-gradient-to-br from-[#00a3ff] to-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-200 mb-6 relative"
          >
            <AnimatedDroplet size={48} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">HydroFlow</h1>
          <p className="text-sm font-bold text-[#00a3ff] tracking-widest uppercase">Intelligent Irrigation</p>
        </div>

        <div className="space-y-4">
          <p className="text-center text-slate-500 text-sm mb-6">Select a role to continue</p>
          
          <button 
            onClick={() => handleLogin('admin')}
            className="w-full bg-white hover:bg-slate-50 border-2 border-slate-100 hover:border-blue-200 p-4 rounded-2xl flex items-center gap-4 transition-all group"
          >
            <div className="bg-purple-100 p-3 rounded-xl text-purple-600 group-hover:scale-110 transition-transform">
              <Shield size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-slate-800">Admin Login</h3>
              <p className="text-xs text-slate-500">Full access to manage hardware and users</p>
            </div>
          </button>

          <button 
            onClick={() => handleLogin('view_only')}
            className="w-full bg-white hover:bg-slate-50 border-2 border-slate-100 hover:border-blue-200 p-4 rounded-2xl flex items-center gap-4 transition-all group"
          >
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform">
              <Eye size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-slate-800">View Only Login</h3>
              <p className="text-xs text-slate-500">Read-only access to dashboard and status</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
