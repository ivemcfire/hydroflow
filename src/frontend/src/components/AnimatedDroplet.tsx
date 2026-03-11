// File: src/frontend/src/components/AnimatedDroplet.tsx
import React from 'react';
import { motion } from 'motion/react';
import { Droplet } from 'lucide-react';

interface AnimatedDropletProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

const AnimatedDroplet: React.FC<AnimatedDropletProps> = ({ size = 24, className = "", strokeWidth = 0 }) => {
  return (
    <motion.div
      animate={{ 
        scale: [1, 1.1, 1],
      }}
      transition={{ 
        duration: 2, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
      className={`inline-block ${className}`}
    >
      <Droplet size={size} className="fill-white" strokeWidth={strokeWidth} />
    </motion.div>
  );
};

export default AnimatedDroplet;
