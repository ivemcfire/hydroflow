// File: src/frontend/src/pages/Login.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Droplet, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Login = () => {
  const { dispatch } = useAppContext();
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedRememberMe = localStorage.getItem('hydroflow_rememberMe') === 'true';
    if (savedRememberMe) {
      setRememberMe(true);
      const savedUsername = localStorage.getItem('hydroflow_username');
      const savedPassword = localStorage.getItem('hydroflow_password');
      if (savedUsername && savedPassword) {
        setUsername(savedUsername);
        setPassword(savedPassword);
        // Attempt autologin
        handleAuth(null, savedUsername, savedPassword, true);
      }
    }
  }, []);

  const handleAuth = async (e?: React.FormEvent | null, autoUser?: string, autoPass?: string, isAutoLogin = false) => {
    if (e) e.preventDefault();
    const u = autoUser || username;
    const p = autoPass || password;

    if (!u || !p) {
      setError('Username and password are required.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const endpoint = isRegistering ? '/api/register' : '/api/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: u, password: p }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (rememberMe) {
        localStorage.setItem('hydroflow_rememberMe', 'true');
        localStorage.setItem('hydroflow_username', u);
        localStorage.setItem('hydroflow_password', p);
      } else {
        localStorage.removeItem('hydroflow_rememberMe');
        localStorage.removeItem('hydroflow_username');
        localStorage.removeItem('hydroflow_password');
      }

      const user = {
        name: data.username,
        role: data.role as 'admin' | 'view_only',
        initials: data.username.substring(0, 2).toUpperCase(),
        title: data.role === 'admin' ? 'System Manager' : 'Observer',
      };

      dispatch({ type: 'SET_USER', payload: user });
    } catch (err: any) {
      setError(err.message);
      if (isAutoLogin) {
        // If autologin fails, clear the saved credentials
        localStorage.removeItem('hydroflow_rememberMe');
        localStorage.removeItem('hydroflow_username');
        localStorage.removeItem('hydroflow_password');
        setRememberMe(false);
        setPassword('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7fa] to-[#e0f2fe] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-300/20 rounded-full blur-3xl"
        animate={{ scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, -50, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-xl border border-white/50 w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div
            className="bg-gradient-to-br from-[#00a3ff] to-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-200 mb-6 relative"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Droplet size={48} className="fill-white text-white" />
            <motion.div
              className="absolute inset-0 bg-white/20 rounded-2xl"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">HydroFlow</h1>
          <p className="text-sm font-bold text-[#00a3ff] tracking-widest uppercase">Intelligent Irrigation</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm"
              >
                <AlertCircle size={16} />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3 outline-none transition-all"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer">
              Remember Password (Auto-login)
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
          >
            {isLoading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Droplet size={20} />
              </motion.div>
            ) : isRegistering ? (
              <>
                <UserPlus size={20} /> Register
              </>
            ) : (
              <>
                <LogIn size={20} /> Login
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            className="text-sm text-blue-500 hover:text-blue-700 font-medium transition-colors"
          >
            {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

