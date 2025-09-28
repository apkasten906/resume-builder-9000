import express from 'express';
import { login, me, logout } from '../controllers/auth.js';

const router = express.Router();

// Auth routes
router.post('/login', login);
router.get('/me', me);
router.post('/logout', logout);

export default router;
