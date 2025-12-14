import { Response } from 'express';
import { query } from '../db.js';
import { AuthRequest } from '../middleware/auth.js';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const result = await query(
      'SELECT p.* FROM profiles p JOIN users u ON p.user_id = u.id WHERE u.id = $1',
      [req.userId]
    );
    res.json(result.rows[0] || {});
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name, avatar_url, is_kids } = req.body;

    const profileResult = await query(
      'SELECT id FROM profiles WHERE user_id = $1',
      [req.userId]
    );

    if (profileResult.rows.length === 0) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    const profileId = profileResult.rows[0].id;

    const updateResult = await query(
      `UPDATE profiles SET
        name = COALESCE($1, name),
        avatar_url = COALESCE($2, avatar_url),
        is_kids = COALESCE($3, is_kids),
        updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [name, avatar_url, is_kids, profileId]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const getWatchedMovies = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { order = 'desc', limit = 100, offset = 0 } = req.query;

    const profileResult = await query(
      'SELECT id FROM profiles WHERE user_id = $1',
      [req.userId]
    );

    if (profileResult.rows.length === 0) {
      res.json([]);
      return;
    }

    const result = await query(
      `SELECT * FROM watched_movies
       WHERE profile_id = $1
       ORDER BY watched_at ${order === 'asc' ? 'ASC' : 'DESC'}
       LIMIT $2 OFFSET $3`,
      [profileResult.rows[0].id, limit, offset]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get watched movies error:', error);
    res.status(500).json({ error: 'Failed to get watched movies' });
  }
};

export const addWatchedMovie = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { movie_id, title, poster_path, rating } = req.body;

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
      `INSERT INTO watched_movies (profile_id, movie_id, title, poster_path, rating)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (profile_id, movie_id) DO UPDATE SET
         title = EXCLUDED.title,
         poster_path = EXCLUDED.poster_path,
         rating = EXCLUDED.rating,
         watched_at = NOW()
       RETURNING *`,
      [profileResult.rows[0].id, movie_id, title, poster_path, rating]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add watched movie error:', error);
    res.status(500).json({ error: 'Failed to add watched movie' });
  }
};

export const removeWatchedMovie = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { movieId } = req.params;

    const profileResult = await query(
      'SELECT id FROM profiles WHERE user_id = $1',
      [req.userId]
    );

    if (profileResult.rows.length === 0) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    await query(
      'DELETE FROM watched_movies WHERE profile_id = $1 AND movie_id = $2',
      [profileResult.rows[0].id, movieId]
    );

    res.json({ message: 'Movie removed from watched list' });
  } catch (error) {
    console.error('Remove watched movie error:', error);
    res.status(500).json({ error: 'Failed to remove watched movie' });
  }
};

export const getPreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const profileResult = await query(
      'SELECT id FROM profiles WHERE user_id = $1',
      [req.userId]
    );

    if (profileResult.rows.length === 0) {
      res.json({});
      return;
    }

    const result = await query(
      'SELECT * FROM user_preferences WHERE profile_id = $1',
      [profileResult.rows[0].id]
    );

    res.json(result.rows[0] || {});
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to get preferences' });
  }
};

export const updatePreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { favorite_genres, language, hide_horror } = req.body;

    const profileResult = await query(
      'SELECT id FROM profiles WHERE user_id = $1',
      [req.userId]
    );

    if (profileResult.rows.length === 0) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    const result = await query(
      `UPDATE user_preferences SET
        favorite_genres = COALESCE($1, favorite_genres),
        language = COALESCE($2, language),
        hide_horror = COALESCE($3, hide_horror),
        updated_at = NOW()
       WHERE profile_id = $4
       RETURNING *`,
      [favorite_genres, language, hide_horror, profileResult.rows[0].id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
};

export const updateMovieRating = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { movieId } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be between 1 and 5' });
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
      `UPDATE watched_movies SET
        rating = $1,
        updated_at = NOW()
       WHERE profile_id = $2 AND movie_id = $3
       RETURNING *`,
      [rating, profileResult.rows[0].id, movieId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Movie not found in watched list' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update rating error:', error);
    res.status(500).json({ error: 'Failed to update rating' });
  }
};

export const getMovieStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const profileResult = await query(
      'SELECT id FROM profiles WHERE user_id = $1',
      [req.userId]
    );

    if (profileResult.rows.length === 0) {
      res.json({
        totalWatched: 0,
        averageRating: 0,
        watchedThisMonth: 0,
        watchedThisYear: 0
      });
      return;
    }

    const result = await query(
      'SELECT * FROM watched_movies WHERE profile_id = $1',
      [profileResult.rows[0].id]
    );

    const data = result.rows;
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const stats = {
      totalWatched: data.length,
      averageRating: 0,
      watchedThisMonth: 0,
      watchedThisYear: 0
    };

    if (data.length > 0) {
      const ratedMovies = data.filter((m: { rating?: number }) => m.rating);
      if (ratedMovies.length > 0) {
        stats.averageRating = ratedMovies.reduce((sum: number, m: { rating: number }) => sum + m.rating, 0) / ratedMovies.length;
      }

      data.forEach((movie: { watched_at: string | Date }) => {
        const watchedDate = new Date(movie.watched_at);
        if (watchedDate.getFullYear() === thisYear) {
          stats.watchedThisYear++;
          if (watchedDate.getMonth() === thisMonth) {
            stats.watchedThisMonth++;
          }
        }
      });
    }

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
};

