import express from 'express';
import { authService } from '../services/authService.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }
  const result = await authService.login(email, password);
  if (!result) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.json(result);
});

router.get('/me', async (req, res) => {
  const user = await authService.getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(user);
});

export default router;
