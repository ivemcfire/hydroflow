// File: src/backend/controllers/pumpController.ts
import { Request, Response } from 'express';

// Mock DB for now
const pumps = [
  { id: 'pump-1', name: 'Main Water Pump', status: 'off', flowRate: 0 },
  { id: 'pump-2', name: 'Nutrient Pump A', status: 'on', flowRate: 1.5 },
  { id: 'pump-3', name: 'Nutrient Pump B', status: 'off', flowRate: 0 },
];

export const getPumps = (req: Request, res: Response) => {
  res.json(pumps);
};

export const togglePump = (req: Request, res: Response) => {
  const { id } = req.params;
  const pump = pumps.find((p) => p.id === id);
  
  if (!pump) {
    return res.status(404).json({ error: 'Pump not found' });
  }

  pump.status = pump.status === 'on' ? 'off' : 'on';
  pump.flowRate = pump.status === 'on' ? 1.5 : 0;

  // In a real app, we would publish to MQTT here
  console.log(`[MQTT] Publishing to topic hydroflow/pumps/${id}/set: ${pump.status}`);

  res.json(pump);
};
