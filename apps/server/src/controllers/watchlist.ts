import { Response } from 'express';
import { query } from '../db.js';
import { AuthRequest } from '../middleware/auth.js';

export const getWatchlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { media_type } = req.query;

    const profileResult = await query(
      'SELECT id FROM profiles WHERE user_id = $1',
      [req.userId]
    );

    if (profileResult.rows.length === 0) {
      res.json([]);
      return;
    }

    let sql = 'SELECT * FROM watchlist WHERE profile_id = $1';
    const params: unknown[] = [profileResult.rows[0].id];

    if (media_type) {
      sql += ' AND media_type = $2';
      params.push(media_type);
    }

    sql += ' ORDER BY added_at DESC';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({ error: 'Failed to get watchlist' });
  }
};

export const addToWatchlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { movie_id, media_type = 'movie', title, poster_path } = req.body;

    if (!movie_id) {
      res.status(400).json({ error: 'movie_id required' });
      return;
    }

    const profileResult = await query(
      'SELECT id FROM profiles WHERE user_id = $1',
      [req.userId]
    );

    if (profileResult.rows.length === 0) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    const result = await query(
      `INSERT INTO watchlist (profile_id, movie_id, media_type, title, poster_path)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (profile_id, movie_id, media_type) DO UPDATE SET
         title = EXCLUDED.title,
         poster_path = EXCLUDED.poster_path,
         added_at = NOW()
       RETURNING *`,
      [profileResult.rows[0].id, movie_id, media_type, title, poster_path]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
};

export const removeFromWatchlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { movieId } = req.params;
    const { media_type = 'movie' } = req.query;

    const profileResult = await query(
      'SELECT id FROM profiles WHERE user_id = $1',
      [req.userId]
    );

    if (profileResult.rows.length === 0) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    await query(
      'DELETE FROM watchlist WHERE profile_id = $1 AND movie_id = $2 AND media_type = $3',
      [profileResult.rows[0].id, movieId, media_type]
    );

    res.json({ message: 'Item removed from watchlist' });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
};

export const isInWatchlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { movieId } = req.params;
    const { media_type = 'movie' } = req.query;

    const profileResult = await query(
      'SELECT id FROM profiles WHERE user_id = $1',
      [req.userId]
    );

    if (profileResult.rows.length === 0) {
      res.json({ inWatchlist: false });
      return;
    }

    const result = await query(
      'SELECT id FROM watchlist WHERE profile_id = $1 AND movie_id = $2 AND media_type = $3',
      [profileResult.rows[0].id, movieId, media_type]
    );

    res.json({ inWatchlist: result.rows.length > 0 });
  } catch (error) {
    console.error('Check watchlist error:', error);
    res.status(500).json({ error: 'Failed to check watchlist' });
  }
};

