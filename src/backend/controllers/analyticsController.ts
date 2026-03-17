// File: src/backend/controllers/analyticsController.ts
import { Request, Response } from 'express';
import { db } from '../firebase';

export interface SensorLog {
  id: string;
  sensor: string;
  value: number;
  unit: string;
  timestamp: string;
}

const generateWeeklyData = (base1: number, variance1: number, base2?: number, variance2?: number, isFloat = false) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => {
    const point: any = { name: day };
    
    let val1 = base1 + (Math.random() * variance1 * 2 - variance1);
    point.value1 = isFloat ? Number(val1.toFixed(2)) : Math.round(val1);
    
    if (base2 !== undefined && variance2 !== undefined) {
      let val2 = base2 + (Math.random() * variance2 * 2 - variance2);
      point.value2 = isFloat ? Number(val2.toFixed(2)) : Math.round(val2);
    }
    return point;
  });
};

const analyticsDB: Record<number, any[]> = {
  1: generateWeeklyData(3000, 800, 2200, 500), // Water Usage vs AI Optimized (Liters)
  2: generateWeeklyData(45, 15),               // Soil Moisture Trends (%)
  3: generateWeeklyData(24, 6),                // Temperature History (°C)
  4: generateWeeklyData(60, 15),               // Humidity Levels (%)
  5: generateWeeklyData(1.5, 0.4, undefined, undefined, true), // Nutrient (EC) Levels (mS/cm)
  6: generateWeeklyData(6.0, 0.8, undefined, undefined, true), // pH Balance History
  7: generateWeeklyData(120, 30),              // Pump Energy Consumption (kWh)
  8: generateWeeklyData(70, 20),               // Tank Level History (%)
  9: generateWeeklyData(400, 100),             // Light Exposure (PAR) (µmol/m²/s)
  10: generateWeeklyData(85, 10),              // Crop Yield Estimates (kg)
};

export const addSensorLog = async (sensor: string, value: number, unit: string, nodeId?: string) => {
  try {
    const newLog = {
      sensor,
      value: Number(value),
      unit,
      nodeId: nodeId || 'unknown',
      timestamp: new Date().toISOString(),
    };
    await db.collection('sensor_logs').add(newLog);
  } catch (error) {
    console.error('Error adding sensor log:', error);
  }
};

export const getAnalyticsData = async (req: Request, res: Response) => {
  const { graphId } = req.params;
  const id = parseInt(graphId as string);
  
  if (isNaN(id) || !analyticsDB[id]) {
    return res.status(404).json({ error: 'Analytics data not found' });
  }
  
  res.json(analyticsDB[id]);
};

export const getSensorLogs = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('sensor_logs')
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();
    
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(logs);
  } catch (error) {
    console.error('Error getting sensor logs:', error);
    res.status(500).json({ error: 'Failed to fetch sensor logs' });
  }
};
