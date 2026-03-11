// File: src/frontend/src/pages/Dashboard.tsx
import React from 'react';
import { motion } from 'motion/react';
import AiInsights from '../components/AiInsights';
import IrrigationNodes from '../components/IrrigationNodes';

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
      className="flex flex-col gap-6 relative z-10"
    >
      <motion.div variants={item}>
        <IrrigationNodes />
      </motion.div>
      
      <motion.div variants={item} className="w-full">
        <AiInsights />
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
