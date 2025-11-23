import express from 'express';
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist
} from '../controllers/watchlist.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getWatchlist);
router.post('/', addToWatchlist);
router.delete('/:movieId', removeFromWatchlist);
router.get('/:movieId/check', isInWatchlist);

export default router;
