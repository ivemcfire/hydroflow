// File: src/frontend/src/components/Sidebar.tsx
import React from 'react';
import { motion } from 'motion/react';
import WeatherCard from './WeatherCard';
import SystemHealth from './SystemHealth';
import AnalyticsWidget from './AnalyticsWidget';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const Sidebar = () => {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 w-full"
    >
      <motion.div variants={item}><WeatherCard /></motion.div>
      <motion.div variants={item}><SystemHealth /></motion.div>
      <motion.div variants={item}><AnalyticsWidget /></motion.div>
    </motion.div>
  );
};

export default Sidebar;
