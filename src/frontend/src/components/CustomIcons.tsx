// File: src/frontend/src/components/CustomIcons.tsx
import React from 'react';

export const PumpIcon = ({ isOn, className }: { isOn: boolean, className?: string }) => {
  const color = isOn ? "#3b82f6" : "#94a3b8";
  return (
    <svg className={className} width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="7" width="12" height="10" rx="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 12h6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 9v6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {isOn ? (
        <g stroke="#3b82f6" strokeWidth="2" strokeLinecap="round">
          <path d="M15 12h3" strokeDasharray="2 4">
            <animate attributeName="stroke-dashoffset" values="6;0" dur="0.5s" repeatCount="indefinite" />
          </path>
          <circle cx="8" cy="12" r="2" fill="#3b82f6">
            <animateTransform attributeName="transform" type="rotate" from="0 8 12" to="360 8 12" dur="0.5s" repeatCount="indefinite" />
          </circle>
        </g>
      ) : (
        <circle cx="8" cy="12" r="2" fill="#94a3b8" />
      )}
    </svg>
  );
};

export const ValveIcon = ({ isOn, className }: { isOn: boolean, className?: string }) => {
  const color = isOn ? "#6366f1" : "#94a3b8";
  return (
    <svg className={className} width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 10h16v4H4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 10V4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 4h8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {isOn ? (
        <g stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
          <path d="M6 12h12" strokeDasharray="4 4">
            <animate attributeName="stroke-dashoffset" values="8;0" dur="0.5s" repeatCount="indefinite" />
          </path>
        </g>
      ) : (
        <path d="M12 10v4" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      )}
    </svg>
  );
};

export const FlowerIcon = ({ humidity, className }: { humidity: number, className?: string }) => {
  const isDry = humidity < 40;
  const isFlooded = humidity > 70;
  const isHealthy = !isDry && !isFlooded;

  const color = isDry ? "#94a3b8" : isFlooded ? "#1e3a8a" : "#22c55e";

  return (
    <svg className={className} width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22V12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {isDry ? (
        <g stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 18c-2 0-4 1-4 3" />
          <path d="M12 16c2 0 4 1 4 3" />
        </g>
      ) : (
        <g stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={isHealthy ? "#22c55e" : "none"}>
          <path d="M12 18c-2-2-4-2-4 0 0 2 2 2 4 0z">
            {isHealthy && <animateTransform attributeName="transform" type="rotate" values="0 12 18; -10 12 18; 0 12 18" dur="3s" repeatCount="indefinite" />}
          </path>
          <path d="M12 16c2-2 4-2 4 0 0 2-2 2-4 0z">
            {isHealthy && <animateTransform attributeName="transform" type="rotate" values="0 12 16; 10 12 16; 0 12 16" dur="3s" repeatCount="indefinite" />}
          </path>
        </g>
      )}
      <circle cx="12" cy="8" r="3" fill={isFlooded ? "#1e3a8a" : isDry ? "none" : "#f59e0b"} stroke={color} strokeWidth="2"/>
      <path d="M12 2v3M12 11v3M5 8h3M16 8h3M7.5 3.5l2 2M14.5 10.5l2 2M7.5 12.5l2-2M14.5 5.5l2-2" stroke={color} strokeWidth="1.5" strokeLinecap="round">
        {isHealthy && <animateTransform attributeName="transform" type="rotate" values="0 12 8; 360 12 8" dur="10s" repeatCount="indefinite" />}
      </path>
      {isFlooded && (
        <path d="M4 20h16" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round">
           <animate attributeName="d" values="M4 20h16; M4 18h16; M4 20h16" dur="2s" repeatCount="indefinite" />
        </path>
      )}
    </svg>
  );
};

export const TankIcon = ({ level, className }: { level: 'empty' | 'half' | 'full', className?: string }) => {
  const color = level === 'empty' ? '#94a3b8' : level === 'half' ? '#3b82f6' : '#0d9488';
  
  return (
    <svg className={className} width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 4v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 4h18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {level === 'half' && (
        <path fill="#3b82f6" opacity="0.5">
          <animate attributeName="d" 
            values="M5 14 Q 12 12 19 14 L 19 22 L 5 22 Z; M5 14 Q 12 16 19 14 L 19 22 L 5 22 Z; M5 14 Q 12 12 19 14 L 19 22 L 5 22 Z" 
            dur="2s" repeatCount="indefinite" />
        </path>
      )}
      {level === 'full' && (
        <path fill="#0d9488" opacity="0.5">
          <animate attributeName="d" 
            values="M5 6 Q 12 4 19 6 L 19 22 L 5 22 Z; M5 6 Q 12 8 19 6 L 19 22 L 5 22 Z; M5 6 Q 12 4 19 6 L 19 22 L 5 22 Z" 
            dur="2s" repeatCount="indefinite" />
        </path>
      )}
    </svg>
  );
};
