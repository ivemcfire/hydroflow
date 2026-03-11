// File: src/frontend/src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Hardware from './pages/Hardware';
import Zones from './pages/Zones';
import Automation from './pages/Automation';
import Schedule from './pages/Schedule';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import WaterDroplets from './components/WaterDroplets';
import Sidebar from './components/Sidebar';
import BackToTop from './components/BackToTop';
import { useAppContext } from './context/AppContext';
import { fetchSystemStatus, fetchPumps } from './services/api';

const AppContent = () => {
  const { state } = useAppContext();
  const { currentUser, systemStatus } = state;
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  if (!currentUser) {
    return <Login />;
  }

  const appColor = systemStatus?.color || 'Blue';
  const isGreen = appColor.toLowerCase() === 'green';
  const bannerClass = isGreen 
    ? 'bg-emerald-500 text-white border-b border-emerald-600' 
    : 'bg-blue-600 text-white border-b border-blue-700';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7fa] to-[#e0f2fe] font-sans text-slate-800 relative overflow-x-hidden flex flex-col pt-24">
      <Header bannerClass={bannerClass} />
      <WaterDroplets />
      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 py-8 relative z-10 w-full flex-grow flex flex-col lg:flex-row gap-8">
        <div className="flex-grow w-full min-w-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/hardware" element={<Hardware />} />
            <Route path="/zones" element={<Zones />} />
            <Route path="/automation" element={<Automation />} />
            <Route path="/schedule" element={<Schedule />} />
            {currentUser.role === 'admin' && (
              <Route path="/admin" element={<AdminPanel />} />
            )}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        {isDashboard && (
          <div className="w-full lg:w-[320px] xl:w-[380px] flex flex-col gap-6 shrink-0">
            <Sidebar />
          </div>
        )}
      </main>
      <BackToTop />
    </div>
  );
};

function App() {
  const { dispatch } = useAppContext();

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

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
