import bcrypt from 'bcrypt';
import { query } from '../db.js';
import { generateToken } from '../utils/jwt.js';

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Check if user exists
    const userExists = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userResult = await query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, passwordHash]
    );
    const user = userResult.rows[0];

    // Create profile
    await query(
      'INSERT INTO profiles (user_id, name) VALUES ($1, $2)',
      [user.id, name || email.split('@')[0]]
    );

    // Create preferences
    await query(
      'INSERT INTO user_preferences (profile_id) SELECT id FROM profiles WHERE user_id = $1',
      [user.id]
    );

    const token = generateToken(user.id);
    res.status(201).json({ user, token });
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

    const userResult = await query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);
    res.json({ user: { id: user.id, email: user.email }, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
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
      // Check if email is already taken
      const existing = await query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, userId]
      );
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Email already in use' });
      }

      await query('UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2', [email, userId]);
    }

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [passwordHash, userId]);
    }

    const userResult = await query('SELECT id, email FROM users WHERE id = $1', [userId]);
    res.json({ user: userResult.rows[0] });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const userResult = await query('SELECT id FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      // For security, don't reveal if email exists
      return res.json({ message: 'If account exists, password reset link sent' });
    }

    // In a real app, generate a reset token and send email
    // For now, just acknowledge the request
    res.json({ message: 'Password reset link sent to email' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
};
