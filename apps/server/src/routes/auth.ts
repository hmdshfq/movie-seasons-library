import express from 'express';
import { register, login, getSession, updateUser, resetPassword, logout, refreshAccessToken } from '../controllers/auth.js';
import { authenticateToken } from '../middleware/auth.js';
import { rateLimiters } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes with rate limiting
router.post('/register', rateLimiters.register, register);
router.post('/login', rateLimiters.login, login);
router.post('/reset-password', rateLimiters.resetPassword, resetPassword);

// Token refresh endpoint
router.post('/refresh', refreshAccessToken);

// Protected routes
router.get('/session', authenticateToken, getSession);
router.put('/update', authenticateToken, updateUser);
router.post('/logout', authenticateToken, logout);

export default router;

