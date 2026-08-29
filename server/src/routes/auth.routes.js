import { Router } from 'express';
import { register, login, logout, refresh, getMe } from '../controllers/auth.controller.js';
import { authenticateUser } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import validate from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';

const router = Router();

// ─── Public routes (rate limited) ─────────────────────
router.post('/auth/register', authLimiter, validate(registerSchema), register);
router.post('/auth/login', authLimiter, validate(loginSchema), login);
router.post('/auth/refresh', authLimiter, refresh);

// ─── Protected routes ─────────────────────────────────
router.post('/auth/logout', authenticateUser, logout);
router.get('/auth/me', authenticateUser, getMe);

export default router;
