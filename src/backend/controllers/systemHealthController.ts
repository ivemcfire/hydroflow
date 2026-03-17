// File: src/backend/controllers/systemHealthController.ts
import { Request, Response } from 'express';
import { db } from '../firebase';

export const getSystemHealth = async (req: Request, res: Response) => {
  try {
    const pumpsSnapshot = await db.collection('pumps').get();
    const pumps = pumpsSnapshot.docs.map(doc => doc.data());
    const activePumps = pumps.filter((p: any) => p.status === 'on').length;
    const totalPumps = pumps.length;

    // Get latest sensor data (mocked in nodeController for now, but we can try to fetch from sensor_logs)
    const sensorSnapshot = await db.collection('sensor_logs')
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();
    
    const latestLogs = sensorSnapshot.docs.map(doc => doc.data());
    const tankLevel = latestLogs.find((l: any) => l.sensor === 'Tank Level')?.value || 78;
    const soilMoisture = latestLogs.find((l: any) => l.sensor === 'Soil Moisture')?.value || 62;
    
    const healthData = {
      status: 'ok',
      color: process.env.APP_COLOR || 'blue',
      systemOnline: 99.9, // Simulated uptime
      activePumps,
      totalPumps,
      waterStorage: Math.round(tankLevel),
      avgSoilHumidity: Math.round(soilMoisture),
    };

    res.json(healthData);
  } catch (error) {
    console.error('Error getting system health:', error);
    res.status(500).json({ error: 'Failed to fetch system health' });
  }
};
