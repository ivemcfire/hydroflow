// File: src/frontend/src/components/HardwareIcon.tsx
import React from 'react';
import { Activity, Zap } from 'lucide-react';
import { PumpIcon, ValveIcon, FlowerIcon, TankIcon } from './CustomIcons';

const HardwareIcon = ({ type, className }: { type: string, className?: string }) => {
  if (type === 'Pump') {
    return (
      <div className={className}>
        <PumpIcon isOn={true} className="w-full h-full" />
      </div>
    );
  }
  if (type === 'Valve') {
    return (
      <div className={className}>
        <ValveIcon isOn={true} className="w-full h-full" />
      </div>
    );
  }
  if (type === 'Soil Sensor') {
    return (
      <div className={className}>
        <FlowerIcon humidity={55} className="w-full h-full" />
      </div>
    );
  }
  if (type === 'Dual IR Sensor') {
    return (
      <div className={className}>
        <TankIcon level="half" className="w-full h-full" />
      </div>
    );
  }
  if (type === 'Automation') {
    return <Zap className={className} />;
  }
  return <Activity className={className} />;
};

export default HardwareIcon;
