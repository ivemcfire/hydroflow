// File: src/backend/controllers/pumpController.ts
import { Request, Response } from 'express';
import { addActivityLog } from './activityController';
import { db } from '../firebase';
import { publishCommand } from '../services/mqttService';

export const getPumps = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('pumps').get();
    const pumps = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // If no pumps exist, seed with initial data
    if (pumps.length === 0) {
      const initialPumps = [
        { name: 'Main Water Pump', status: 'off', flowRate: 0 },
        { name: 'Nutrient Pump A', status: 'on', flowRate: 1.5 },
        { name: 'Nutrient Pump B', status: 'off', flowRate: 0 },
      ];
      
      const batch = db.batch();
      initialPumps.forEach(p => {
        const ref = db.collection('pumps').doc();
        batch.set(ref, p);
      });
      await batch.commit();
      
      const newSnapshot = await db.collection('pumps').get();
      const newPumps = newSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return res.json(newPumps);
    }
    
    res.json(pumps);
  } catch (error) {
    console.error('Error getting pumps:', error);
    res.status(500).json({ error: 'Failed to fetch pumps' });
  }
};

export const togglePump = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  
  try {
    const pumpRef = db.collection('pumps').doc(id);
    const doc = await pumpRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Pump not found' });
    }

    const pump = doc.data() as any;
    const newStatus = pump.status === 'on' ? 'off' : 'on';
    const newFlowRate = newStatus === 'on' ? 1.5 : 0;

    await pumpRef.update({
      status: newStatus,
      flowRate: newFlowRate
    });

    // Publish to MQTT
    publishCommand('node-1', pump.name.replace(/\s+/g, '_'), newStatus === 'on' ? 'ON' : 'OFF');
    
    // Log the activity
    await addActivityLog(
      newStatus === 'on' ? 'success' : 'info', 
      `${pump.name} was turned ${newStatus}`
    );

    res.json({ id, ...pump, status: newStatus, flowRate: newFlowRate });
  } catch (error) {
    console.error('Error toggling pump:', error);
    res.status(500).json({ error: 'Failed to toggle pump' });
  }
};
