import bcrypt from 'bcrypt';
import { query } from '../db.js';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { validatePassword, validateEmail, sanitizeInput } from '../utils/validators.js';
import { addTokenToBlacklist } from '../middleware/tokenBlacklist.js';

const setTokenCookies = (res, accessToken, refreshToken) => {
  // Set access token as HttpOnly cookie (15 minutes)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  // Set refresh token as HttpOnly cookie (7 days)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const sanitizedName = sanitizeInput(name || '');

    if (!validateEmail(sanitizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        error: 'Password does not meet requirements',
        requirements: passwordValidation.errors 
      });
    }

    // Check if user exists
    const userExists = await query('SELECT id FROM users WHERE email = $1', [sanitizedEmail]);
    if (userExists.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password with salt rounds 12 for better security
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const userResult = await query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [sanitizedEmail, passwordHash]
    );
    const user = userResult.rows[0];

    // Create profile
    await query(
      'INSERT INTO profiles (user_id, name) VALUES ($1, $2)',
      [user.id, sanitizedName || sanitizedEmail.split('@')[0]]
    );

    // Create preferences
    await query(
      'INSERT INTO user_preferences (profile_id) SELECT id FROM profiles WHERE user_id = $1',
      [user.id]
    );

    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Set tokens as HttpOnly cookies
    setTokenCookies(res, accessToken, refreshToken);

    res.status(201).json({ 
      user: { id: user.id, email: user.email },
      // Also send tokens for backward compatibility with client
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const sanitizedEmail = sanitizeInput(email).toLowerCase();

    const userResult = await query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [sanitizedEmail]
    );

    if (userResult.rows.length === 0) {
      // Generic message prevents email enumeration
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Set tokens as HttpOnly cookies
    setTokenCookies(res, accessToken, refreshToken);

    res.json({ 
      user: { id: user.id, email: user.email },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    let refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }

    const newAccessToken = generateToken(decoded.userId);

    // Update access token cookie
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
};

export const getSession = async (req, res) => {
  try {
    const userResult = await query(
      'SELECT id, email FROM users WHERE id = $1',
      [req.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    const profileResult = await query(
      'SELECT * FROM profiles WHERE user_id = $1',
      [user.id]
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        user_metadata: profileResult.rows[0] || {}
      }
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userId = req.userId;

    if (email) {
      const sanitizedEmail = sanitizeInput(email).toLowerCase();

      if (!validateEmail(sanitizedEmail)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Check if email is already taken
      const existing = await query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [sanitizedEmail, userId]
      );
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Email already in use' });
      }

      await query('UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2', [sanitizedEmail, userId]);
    }

    if (password) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({ 
          error: 'Password does not meet requirements',
          requirements: passwordValidation.errors 
        });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [passwordHash, userId]);
    }

    const userResult = await query('SELECT id, email FROM users WHERE id = $1', [userId]);
    res.json({ user: userResult.rows[0] });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const logout = async (req, res) => {
  try {
    // Add current token to blacklist
    if (req.token) {
      addTokenToBlacklist(req.token);
    }

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const sanitizedEmail = sanitizeInput(email).toLowerCase();

    if (!validateEmail(sanitizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const userResult = await query('SELECT id FROM users WHERE email = $1', [sanitizedEmail]);

    if (userResult.rows.length === 0) {
      // For security, don't reveal if email exists
      return res.json({ message: 'If account exists, password reset link sent' });
    }

    // TODO: Implement password reset token generation and email sending
    // For now, just acknowledge the request
    res.json({ message: 'Password reset link sent to email' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
};
