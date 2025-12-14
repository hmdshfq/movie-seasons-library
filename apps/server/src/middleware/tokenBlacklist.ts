/**
 * Token blacklist for handling logout and token invalidation
 * In production, use Redis for distributed systems
 */
const tokenBlacklist = new Set<string>();

export const addTokenToBlacklist = (token: string): void => {
  tokenBlacklist.add(token);
};

export const isTokenBlacklisted = (token: string): boolean => {
  return tokenBlacklist.has(token);
};

// Cleanup expired tokens periodically (every hour)
// In production, store expiry times and clean up only expired tokens
setInterval(() => {
  // Note: This is a simple implementation. For production, implement proper TTL handling
  if (tokenBlacklist.size > 100000) {
    // Clear if too many entries (memory leak prevention)
    tokenBlacklist.clear();
  }
}, 60 * 60 * 1000);

export { tokenBlacklist };

