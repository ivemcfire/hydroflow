// File: src/frontend/src/pages/Dashboard.tsx
import React from 'react';
import { motion } from 'motion/react';
import AiInsights from '../components/AiInsights';
import IrrigationNodes from '../components/IrrigationNodes';
import WeatherCard from '../components/WeatherCard';
import SystemHealth from '../components/SystemHealth';
import RecentActivity from '../components/RecentActivity';

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

const Dashboard = () => {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10"
    >
      <div className="lg:col-span-2 space-y-6">
        <motion.div variants={item}><AiInsights /></motion.div>
        <motion.div variants={item}><IrrigationNodes /></motion.div>
      </div>
      <div className="space-y-6">
        <motion.div variants={item}><WeatherCard /></motion.div>
        <motion.div variants={item}><SystemHealth /></motion.div>
        <motion.div variants={item}><RecentActivity /></motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
