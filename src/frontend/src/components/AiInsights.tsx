// File: src/frontend/src/components/AiInsights.tsx
import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Droplets, CloudRain, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Insight = {
  title: string;
  description: string;
  type: string;
};

const AiInsights = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/insights');
      const data = await res.json();
      setInsights(data);
    } catch (err) {
      console.error('Failed to fetch AI insights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getIconForType = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'weather':
        return <CloudRain size={18} />;
      case 'moisture':
        return <Droplets size={18} />;
      case 'anomaly':
      default:
        return <AlertTriangle size={18} />;
    }
  };

  const getColorClassForType = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'weather':
        return 'bg-blue-50/50 border-blue-100/50 text-blue-600';
      case 'moisture':
        return 'bg-emerald-50/50 border-emerald-100/50 text-emerald-600';
      case 'anomaly':
      default:
        return 'bg-orange-50/50 border-orange-100/50 text-orange-600';
    }
  };

  const getIconBgClassForType = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'weather':
        return 'bg-blue-100';
      case 'moisture':
        return 'bg-emerald-100';
      case 'anomaly':
      default:
        return 'bg-orange-100';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-[#00a3ff]">
          <Sparkles size={20} />
          <h2 className="text-sm font-bold tracking-wide uppercase">AI System Insights</h2>
        </div>
        <button
          onClick={fetchInsights}
          disabled={isLoading}
          className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
        >
          <motion.div
            animate={{ rotate: isLoading ? 360 : 0 }}
            transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: 'linear' }}
          >
            <RefreshCw size={16} />
          </motion.div>
          Refresh
        </button>
      </div>

      <div className="space-y-4 min-h-[200px] relative">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 space-y-4"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles size={32} className="text-[#00a3ff]" />
              </motion.div>
              <p className="text-sm font-medium">Generating intelligent insights...</p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {insights.length > 0 ? (
                insights.map((insight, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`flex items-start gap-4 p-4 rounded-xl border ${getColorClassForType(insight.type)}`}
                  >
                    <div className={`${getIconBgClassForType(insight.type)} p-2 rounded-lg mt-0.5`}>
                      {getIconForType(insight.type)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 mb-1">{insight.title}</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">{insight.description}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-8">No current insights available.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AiInsights;
