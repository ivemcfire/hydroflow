// File: src/frontend/src/components/Header.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Bell, LogOut, Users, Info, Phone, X, Send, Menu, History } from 'lucide-react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import RecentActivity from './RecentActivity';
import AnimatedDroplet from './AnimatedDroplet';

const Header = ({ bannerClass = '' }: { bannerClass?: string }) => {
  const { state, dispatch } = useAppContext();
  const { currentUser } = state;
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch({ type: 'SET_USER', payload: null });
  };

  if (!currentUser) return null;

  const UserProfileContent = () => (
    <>
      <div className="text-right hidden sm:block">
        <p className="text-sm font-semibold text-slate-900 leading-tight">{currentUser.name}</p>
        <p className="text-xs text-slate-500">{currentUser.title}</p>
      </div>
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-bold shadow-sm border border-blue-200/50">
        {currentUser.initials}
      </div>
    </>
  );

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/hardware', label: 'Hardware', adminOnly: true },
    { to: '/automation', label: 'Automation' },
    { to: '/zones', label: 'Zones' },
    { to: '/schedule', label: 'Schedule' },
  ];

  const handleWidgetClick = (id: string) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({behavior: 'smooth'});
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({behavior: 'smooth'});
    }
  };

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-6 py-4 flex flex-wrap gap-4 justify-between items-center fixed top-0 left-0 w-full z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-[#00a3ff] p-2 rounded-xl text-white shadow-sm shadow-blue-200">
              <AnimatedDroplet size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">HydroFlow</h1>
              <p className="text-[10px] font-bold text-[#00a3ff] tracking-wider uppercase">Intelligent Irrigation</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 ml-4">
            {navLinks.map((link) => {
              if (link.adminOnly && currentUser.role !== 'admin') return null;
              return (
                <NavLink 
                  key={link.to}
                  to={link.to} 
                  className={({isActive}) => `px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isActive ? 'bg-[#f0f7fa] text-[#00a3ff]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  {link.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Mobile Menu Toggle */}
          <div className="lg:hidden relative" ref={mobileMenuRef}>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-2"
            >
              <Menu size={24} />
            </button>
            
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 overflow-hidden origin-top-right"
                >
                  {navLinks.map((link) => {
                    if (link.adminOnly && currentUser.role !== 'admin') return null;
                    return (
                      <NavLink 
                        key={link.to}
                        to={link.to} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({isActive}) => `block px-4 py-2 text-sm font-semibold transition-colors ${isActive ? 'bg-[#f0f7fa] text-[#00a3ff]' : 'text-slate-600 hover:bg-slate-50 hover:text-[#00a3ff]'}`}
                      >
                        {link.label}
                      </NavLink>
                    );
                  })}
                  
                  <div className="h-px bg-slate-100 my-2"></div>
                  <p className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sidebar Widgets</p>
                  <button 
                    onClick={() => handleWidgetClick('analytics')} 
                    className="w-full text-left px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-[#00a3ff]"
                  >
                    Analytics
                  </button>
                  <button 
                    onClick={() => handleWidgetClick('weather')} 
                    className="w-full text-left px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-[#00a3ff]"
                  >
                    Weather Forecast
                  </button>
                  <button 
                    onClick={() => handleWidgetClick('system-health')} 
                    className="w-full text-left px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-[#00a3ff]"
                  >
                    System Health
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setIsActivityOpen(true)}
            className="text-slate-400 hover:text-slate-600 transition-colors relative hidden sm:block"
          >
            <History size={20} />
          </button>
          
          <button className="text-slate-400 hover:text-slate-600 transition-colors relative hidden sm:block">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
            >
              <UserProfileContent />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 overflow-hidden origin-top-right"
                >
                  <div className="px-4 py-2 border-b border-slate-50 mb-1">
                    <p className="text-sm font-bold text-slate-800">{currentUser.name}</p>
                    <p className="text-xs text-slate-500">{currentUser.role === 'admin' ? 'Administrator' : 'View Only'}</p>
                  </div>
                  
                  {currentUser.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-[#00a3ff] transition-colors"
                    >
                      <Users size={16} />
                      User Management
                    </Link>
                  )}
                  
                  <button 
                    onClick={() => { setIsAboutOpen(true); setIsDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-[#00a3ff] transition-colors text-left"
                  >
                    <Info size={16} />
                    About
                  </button>
                  
                  <button 
                    onClick={() => { setIsContactOpen(true); setIsDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-[#00a3ff] transition-colors text-left"
                  >
                    <Phone size={16} />
                    Contacts
                  </button>
                  
                  <div className="h-px bg-slate-50 my-1"></div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>
      <div className={`w-full py-1 ${bannerClass} z-40 fixed top-[80px] left-0 shadow-sm`}>
      </div>

      {/* Recent Activity Modal */}
      <AnimatePresence>
        {isActivityOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <History size={20} className="text-[#00a3ff]" /> Recent Activity
                </h3>
                <button onClick={() => setIsActivityOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <RecentActivity />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* About Modal */}
      <AnimatePresence>
        {isAboutOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Info size={20} className="text-[#00a3ff]" /> About HydroFlow
                </h3>
                <button onClick={() => setIsAboutOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="flex justify-center mb-6">
                  <div className="bg-[#00a3ff] p-4 rounded-2xl text-white shadow-lg shadow-blue-200">
                    <Droplet size={40} className="fill-white" />
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed text-center">
                  <strong>HydroFlow</strong> is an intelligent, automated irrigation and hydroponics management system. 
                  It seamlessly connects IoT sensors, pumps, and valves to a centralized dashboard, allowing you to monitor 
                  soil moisture, tank levels, and system health in real-time. Powered by AI insights, HydroFlow optimizes 
                  water usage based on weather forecasts and environmental trends, ensuring your plants thrive while 
                  conserving resources. Designed for both small greenhouses and large agricultural zones, it puts complete 
                  control of your water ecosystem right at your fingertips.
                </p>
                <div className="mt-6 text-center text-xs text-slate-400">
                  Version 2.1.0 • Build 8492
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contact Modal */}
      <AnimatePresence>
        {isContactOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Phone size={20} className="text-[#00a3ff]" /> Contact Support
                </h3>
                <button onClick={() => setIsContactOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-6 text-center">
                  <h4 className="font-bold text-slate-800">AquaTech Solutions Inc.</h4>
                  <p className="text-sm text-[#00a3ff] hover:underline cursor-pointer">www.aquatech-hydroflow.com</p>
                  <p className="text-sm text-slate-500">support@aquatech-hydroflow.com</p>
                </div>

                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsContactOpen(false); }}>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Subject</label>
                    <input 
                      type="text" 
                      required
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-[#00a3ff] focus:ring-1 focus:ring-[#00a3ff]" 
                      placeholder="How can we help?" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Message</label>
                    <textarea 
                      required
                      rows={4}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-[#00a3ff] focus:ring-1 focus:ring-[#00a3ff] resize-none" 
                      placeholder="Describe your issue..." 
                    ></textarea>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-[#00a3ff] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 mt-2"
                  >
                    <Send size={16} /> Send Message
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
