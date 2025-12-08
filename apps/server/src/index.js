import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import watchlistRoutes from './routes/watchlist.js';
import tmdbRoutes from './routes/tmdb.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5001',
  'http://localhost:3000',
  'https://mose.up.railway.app',
  process.env.CLIENT_URL
].filter(Boolean);

console.log(`The client URL is ${process.env.CLIENT_URL} and port is ${PORT}`);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/tmdb', tmdbRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve static frontend files
const frontendPath = path.join(__dirname, '../../client/dist');
console.log('Serving frontend from:', frontendPath);
app.use(express.static(frontendPath));

// SPA fallback - serve index.html for all non-API routes
app.use((req, res, next) => {
  res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
    if (err) {
      next(err);
    }
  });
});

// Error handler (must be last)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
