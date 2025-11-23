import express from 'express';
import { register, login, getSession, updateUser, resetPassword } from '../controllers/auth.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/session', authenticateToken, getSession);
router.put('/update', authenticateToken, updateUser);
router.post('/reset-password', resetPassword);

export default router;
