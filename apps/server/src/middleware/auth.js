import { verifyToken } from '../utils/jwt.js';
import { isTokenBlacklisted } from './tokenBlacklist.js';

export const authenticateToken = (req, res, next) => {
  let token = null;

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
    return res.status(401).json({ error: 'No token provided' });
  }

  // Check if token is blacklisted (logged out)
  if (isTokenBlacklisted(token)) {
    return res.status(403).json({ error: 'Token has been revoked' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  req.userId = decoded.userId;
  req.token = token;
  next();
};
