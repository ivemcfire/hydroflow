// File: src/backend/routes/api.ts
import { Router } from 'express';
import { getPumps, togglePump } from '../controllers/pumpController';

const router = Router();

router.get('/pumps', getPumps);
router.post('/pumps/:id/toggle', togglePump);

export default router;
