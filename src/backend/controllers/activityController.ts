// File: src/backend/controllers/activityController.ts
import { Request, Response } from 'express';
import { db } from '../firebase';

export interface ActivityLog {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
}

export const addActivityLog = async (type: ActivityLog['type'], message: string) => {
  try {
    const newLog = {
      type,
      message,
      timestamp: new Date().toISOString(),
    };
    await db.collection('activity').add(newLog);
  } catch (error) {
    console.error('Error adding activity log:', error);
  }
};

export const getActivityLogs = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('activity')
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();
    
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(logs);
  } catch (error) {
    console.error('Error getting activity logs:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
};
