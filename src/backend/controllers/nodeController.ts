// File: src/backend/controllers/nodeController.ts
import { Request, Response } from 'express';
import { addActivityLog } from './activityController';
import { addNotification } from './notificationController';
import { addSensorLog } from './analyticsController';
import { db } from '../firebase';
import { publishSensor } from '../services/mqttService';

export interface NodeRule {
  id: string;
  nodeId: string;
  sensor: string;
  condition: '<' | '>' | '=';
  threshold: number;
  action: 'Turn On' | 'Turn Off';
  component: string;
}

export interface IrrigationNode {
  id: string;
  name: string;
  location: string;
  hardware: string[];
  rules: number;
  status: 'Online' | 'Offline';
  time: string;
}

export const getNodes = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('nodes').get();
    const nodes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Seed if empty
    if (nodes.length === 0) {
      const initialNodes = [
        { name: 'North Garden', location: 'Backyard North', hardware: ['Main Pump', 'Zone 1 Valve', 'Soil Sensor', 'Tank Sensor'], status: 'Online', lastSeen: new Date().toISOString() },
        { name: 'South Greenhouse', location: 'Greenhouse Area', hardware: ['Zone 2 Valve', 'Temp Sensor'], status: 'Online', lastSeen: new Date().toISOString() },
      ];
      const batch = db.batch();
      initialNodes.forEach(n => {
        const ref = db.collection('nodes').doc();
        batch.set(ref, n);
      });
      await batch.commit();
      const newSnapshot = await db.collection('nodes').get();
      return res.json(newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }

    res.json(nodes);
  } catch (error) {
    console.error('Error getting nodes:', error);
    res.status(500).json({ error: 'Failed to fetch nodes' });
  }
};

export const createNode = async (req: Request, res: Response) => {
  try {
    const newNode = {
      ...req.body,
      lastSeen: new Date().toISOString()
    };
    const docRef = await db.collection('nodes').add(newNode);
    await addActivityLog('success', `Node ${newNode.name} created`);
    res.status(201).json({ id: docRef.id, ...newNode });
  } catch (error) {
    console.error('Error creating node:', error);
    res.status(500).json({ error: 'Failed to create node' });
  }
};

export const updateNode = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const nodeRef = db.collection('nodes').doc(id);
    await nodeRef.update({
      ...req.body,
      lastSeen: new Date().toISOString()
    });
    const updated = await nodeRef.get();
    await addActivityLog('info', `Node ${updated.data()?.name} updated`);
    res.json({ id, ...updated.data() });
  } catch (error) {
    console.error('Error updating node:', error);
    res.status(500).json({ error: 'Failed to update node' });
  }
};

export const deleteNode = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const nodeRef = db.collection('nodes').doc(id);
    const node = await nodeRef.get();
    if (!node.exists) return res.status(404).json({ error: 'Node not found' });

    // Delete subcollection rules
    const rulesSnapshot = await nodeRef.collection('rules').get();
    const batch = db.batch();
    rulesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    batch.delete(nodeRef);
    await batch.commit();

    await addActivityLog('warning', `Node ${node.data()?.name} deleted`);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting node:', error);
    res.status(500).json({ error: 'Failed to delete node' });
  }
};

export const getNodeRules = async (req: Request, res: Response) => {
  const nodeId = req.params.nodeId as string;
  try {
    const snapshot = await db.collection('nodes').doc(nodeId).collection('rules').get();
    const rules = snapshot.docs.map(doc => ({
      id: doc.id,
      nodeId,
      ...doc.data()
    }));
    res.json(rules);
  } catch (error) {
    console.error('Error getting node rules:', error);
    res.status(500).json({ error: 'Failed to fetch node rules' });
  }
};

export const createRule = async (req: Request, res: Response) => {
  const nodeId = req.params.nodeId as string;
  try {
    const newRule = {
      ...req.body,
    };
    const docRef = await db.collection('nodes').doc(nodeId).collection('rules').add(newRule);
    await addActivityLog('info', `New rule added to node`);
    res.status(201).json({ id: docRef.id, nodeId, ...newRule });
  } catch (error) {
    console.error('Error creating rule:', error);
    res.status(500).json({ error: 'Failed to create rule' });
  }
};

export const deleteRule = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  // This is a bit tricky because rules are in subcollections
  // We'll search for the rule across all nodes if nodeId isn't provided
  // Or we can assume the client provides nodeId in some way.
  // For now, let's try to find it.
  try {
    const nodesSnapshot = await db.collection('nodes').get();
    for (const nodeDoc of nodesSnapshot.docs) {
      const ruleRef = nodeDoc.ref.collection('rules').doc(id);
      const ruleDoc = await ruleRef.get();
      if (ruleDoc.exists) {
        await ruleRef.delete();
        return res.json({ success: true });
      }
    }
    res.status(404).json({ error: 'Rule not found' });
  } catch (error) {
    console.error('Error deleting rule:', error);
    res.status(500).json({ error: 'Failed to delete rule' });
  }
};

// --- SIMULATION ENGINE ---
export let mockSensorData: Record<string, number> = {
  'Soil Moisture': 45,
  'Temperature': 22,
  'Tank Level': 80
};

export const evaluateRules = async () => {
  mockSensorData['Soil Moisture'] += (Math.random() * 4 - 2);
  mockSensorData['Temperature'] += (Math.random() * 2 - 1);
  mockSensorData['Tank Level'] -= (Math.random() * 0.5);
  
  mockSensorData['Soil Moisture'] = Math.max(0, Math.min(100, mockSensorData['Soil Moisture']));
  mockSensorData['Tank Level'] = Math.max(0, Math.min(100, mockSensorData['Tank Level']));

  // Publish via MQTT (this will trigger Firestore updates via mqttService)
  publishSensor('node-1', 'Soil Moisture', Number(mockSensorData['Soil Moisture'].toFixed(1)));
  publishSensor('node-1', 'Temperature', Number(mockSensorData['Temperature'].toFixed(1)));
  publishSensor('node-1', 'Tank Level', Number(mockSensorData['Tank Level'].toFixed(1)));

  if (mockSensorData['Tank Level'] < 20 && Math.random() < 0.1) {
    await addNotification('warning', `Tank Level is critically low (${Math.round(mockSensorData['Tank Level'])}%)`);
  }
  
  if (mockSensorData['Soil Moisture'] < 25 && Math.random() < 0.1) {
    await addNotification('warning', `Soil Moisture is very low (${Math.round(mockSensorData['Soil Moisture'])}%)`);
  }
  
  if (mockSensorData['Temperature'] > 35 && Math.random() < 0.1) {
    await addNotification('error', `High Temperature Alert: ${Math.round(mockSensorData['Temperature'])}°C`);
  }

  // Fetch all rules from all nodes
  try {
    const nodesSnapshot = await db.collection('nodes').get();
    for (const nodeDoc of nodesSnapshot.docs) {
      const rulesSnapshot = await nodeDoc.ref.collection('rules').get();
      rulesSnapshot.docs.forEach(ruleDoc => {
        const rule = ruleDoc.data() as any;
        const currentValue = mockSensorData[rule.sensor];
        if (currentValue === undefined) return;

        let conditionMet = false;
        switch (rule.condition) {
          case '<': conditionMet = currentValue < rule.threshold; break;
          case '>': conditionMet = currentValue > rule.threshold; break;
          case '=': conditionMet = Math.abs(currentValue - rule.threshold) < 1; break;
        }

        if (conditionMet && Math.random() < 0.05) {
          addActivityLog('info', `Rule triggered: ${rule.sensor} is ${Math.round(currentValue)}. Action: ${rule.action} ${rule.component}`);
        }
      });
    }
  } catch (error) {
    console.error('Error in simulation engine:', error);
  }
};

setInterval(evaluateRules, 10000); // Run every 10 seconds to reduce load
