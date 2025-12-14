import jwt, { SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  throw new Error('CRITICAL: JWT_SECRET environment variable is not set. Cannot start server.');
}

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '15m'; // Short-lived access token
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

interface TokenPayload {
  userId: number;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export const generateToken = (userId: number): string => {
  // Type assertion needed because expiresIn expects StringValue from 'ms' package,
  // but our string literals ('15m', '7d') are valid time strings at runtime
  return jwt.sign({ userId, type: 'access' }, JWT_SECRET, { expiresIn: JWT_EXPIRY } as SignOptions);
};

export const generateRefreshToken = (userId: number): string => {
  // Type assertion needed because expiresIn expects StringValue from 'ms' package,
  // but our string literals ('15m', '7d') are valid time strings at runtime
  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY } as SignOptions);
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    if (decoded.type !== 'access') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    if (decoded.type !== 'refresh') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
};

export const decodeToken = (token: string): TokenPayload | null => {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch (error) {
    return null;
  }
};

