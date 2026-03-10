// File: src/backend/routes/api.ts
import { Router } from 'express';
import { getPumps, togglePump } from '../controllers/pumpController';
import { login, register } from '../controllers/authController';
import { getInsights } from '../controllers/aiController';

const router = Router();

router.get('/pumps', getPumps);
router.post('/pumps/:id/toggle', togglePump);

router.post('/login', login);
router.post('/register', register);

router.get('/ai/insights', getInsights);

export default router;
