// packages/api/src/routes/auth.ts
import { Router } from 'express';
import { login, logout, me } from '../controllers/auth.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

export default router;
