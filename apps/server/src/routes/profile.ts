import express from 'express';
import {
  getProfile,
  updateProfile,
  getWatchedMovies,
  addWatchedMovie,
  removeWatchedMovie,
  getPreferences,
  updatePreferences,
  updateMovieRating,
  getMovieStats
} from '../controllers/profile.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getProfile);
router.put('/', updateProfile);
router.get('/watched-movies', getWatchedMovies);
router.post('/watched-movies', addWatchedMovie);
router.delete('/watched-movies/:movieId', removeWatchedMovie);
router.put('/watched-movies/:movieId/rating', updateMovieRating);
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);
router.get('/stats', getMovieStats);

export default router;

