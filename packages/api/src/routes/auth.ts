// packages/api/src/routes/auth.ts
import { Router } from 'express';
import {
  login,
  logout,
  me,
  register,
  verifyEmail,
  resendVerification,
  getVerificationToken,
} from '../controllers/auth.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();
router.post('/login', login);
router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/logout', logout);
router.get('/me', requireAuth, me);
// Development-only endpoint to get verification token (requires authentication)
router.get('/verification-token', requireAuth, getVerificationToken);

export default router;
