import { Request, Response, NextFunction } from 'express';

/**
 * Simple in-memory rate limiter for auth endpoints
 * In production, consider using Redis for distributed rate limiting
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

const RATE_LIMIT_CONFIG: Record<string, RateLimitConfig> = {
  login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  register: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  resetPassword: { maxAttempts: 3, windowMs: 60 * 60 * 1000 } // 3 attempts per hour
};

const getClientIdentifier = (req: Request): string => {
  // Use IP address as identifier, or email if available
  return req.ip || (req.socket.remoteAddress || 'unknown');
};

const getKey = (identifier: string, endpoint: string): string => {
  return `${endpoint}:${identifier}`;
};

export const createRateLimiter = (endpoint: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const config = RATE_LIMIT_CONFIG[endpoint];
    if (!config) {
      return next(); // No rate limit configured
    }

    const identifier = getClientIdentifier(req);
    const key = getKey(identifier, endpoint);
    const now = Date.now();

    // Get or initialize rate limit entry
    let entry = rateLimitStore.get(key);
    if (!entry || now - entry.resetTime > config.windowMs) {
      entry = {
        count: 0,
        resetTime: now
      };
    }

    entry.count++;

    // Check if limit exceeded
    if (entry.count > config.maxAttempts) {
      rateLimitStore.set(key, entry);
      const resetTime = Math.ceil((entry.resetTime + config.windowMs - now) / 1000);
      res.status(429).json({
        error: 'Too many attempts. Please try again later.',
        retryAfter: resetTime
      });
      return;
    }

    rateLimitStore.set(key, entry);
    next();
  };
};

// Cleanup old entries periodically (every hour)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.resetTime > 2 * 60 * 60 * 1000) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 60 * 1000);

export const rateLimiters = {
  login: createRateLimiter('login'),
  register: createRateLimiter('register'),
  resetPassword: createRateLimiter('resetPassword')
};

