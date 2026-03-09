// File: src/frontend/src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Hardware from './pages/Hardware';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import WaterDroplets from './components/WaterDroplets';
import { useAppContext } from './context/AppContext';
import { fetchSystemStatus, fetchPumps } from './services/api';

function App() {
  const { state, dispatch } = useAppContext();
  const { currentUser } = state;

  useEffect(() => {
    const loadData = async () => {
      try {
        const status = await fetchSystemStatus();
        dispatch({ type: 'SET_SYSTEM_STATUS', payload: status });

        const pumps = await fetchPumps();
        dispatch({ type: 'SET_PUMPS', payload: pumps });
      } catch (error) {
        console.error('Failed to load data', error);
      }
    };

    loadData();
  }, [dispatch]);

  if (!currentUser) {
    return <Login />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-[#f0f7fa] to-[#e0f2fe] font-sans text-slate-800 relative overflow-hidden">
        <WaterDroplets />
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/hardware" element={<Hardware />} />
            {currentUser.role === 'admin' && (
              <Route path="/admin" element={<AdminPanel />} />
            )}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
