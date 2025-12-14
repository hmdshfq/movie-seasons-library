import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { isTokenBlacklisted } from './tokenBlacklist.js';

export interface AuthRequest extends Request {
  userId?: number;
  token?: string;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  let token: string | null = null;

  // Try to get token from Authorization header first (Bearer token)
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  }

  // Fall back to HttpOnly cookie
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  // Check if token is blacklisted (logged out)
  if (isTokenBlacklisted(token)) {
    res.status(403).json({ error: 'Token has been revoked' });
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(403).json({ error: 'Invalid or expired token' });
    return;
  }

  req.userId = decoded.userId;
  req.token = token;
  next();
};

