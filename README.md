# Movie Library App

A React + Vite application for tracking and managing movies with a custom Express API backend and PostgreSQL database.

## Architecture

- **Frontend**: React 18, Vite, TailwindCSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL
- **Authentication**: JWT-based custom authentication with bcrypt password hashing

## Project Structure

```
movie-library/
├── src/                      # React frontend
│   ├── components/           # React components
│   ├── contexts/             # React contexts (Auth, Watchlist)
│   ├── lib/                  # Utility libraries (api client)
│   ├── services/             # API service layer
│   └── ...
├── server/                   # Express backend
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/       # Express middleware (auth)
│   │   ├── routes/           # API routes
│   │   ├── utils/            # JWT utilities
│   │   ├── db.js             # Database connection
│   │   └── index.js          # Express app
│   ├── db/
│   │   ├── schema.sql        # Database schema
│   │   └── migrate.js        # Migration runner
│   └── package.json
├── package.json              # Frontend dependencies
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm/pnpm
- PostgreSQL 12+

### 1. Database Setup

#### Option A: Local PostgreSQL

Create a PostgreSQL database:
```bash
createdb movie_library
```

#### Option B: Managed PostgreSQL (Neon, Railway, Render)

1. Create a PostgreSQL database on your preferred provider
2. Copy the connection string

### 2. Backend Setup

```bash
cd server
npm install

# Create .env file with your database credentials
cp .env.example .env

# Update .env with your database connection string
# DATABASE_URL=postgresql://user:password@host:port/movie_library
# JWT_SECRET=your-secret-key-change-in-production
```

Run migrations:
```bash
npm run migrate
```

Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# From project root
npm install

# Create .env file
cp .env.example .env

# .env should contain:
# VITE_API_URL=http://localhost:5000
# VITE_TMDB_API_KEY=your_api_key
```

Start the dev server:
```bash
npm run dev
```

The app will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/session` - Get current session (requires JWT)
- `PUT /api/auth/update` - Update user (requires JWT)
- `POST /api/auth/reset-password` - Request password reset

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `GET /api/profile/preferences` - Get user preferences
- `PUT /api/profile/preferences` - Update preferences
- `GET /api/profile/stats` - Get watched movie statistics

### Watched Movies
- `GET /api/profile/watched-movies` - List watched movies
- `POST /api/profile/watched-movies` - Add watched movie
- `DELETE /api/profile/watched-movies/:movieId` - Remove from watched
- `PUT /api/profile/watched-movies/:movieId/rating` - Update rating

### Watchlist
- `GET /api/watchlist` - Get watchlist
- `POST /api/watchlist` - Add to watchlist
- `DELETE /api/watchlist/:movieId` - Remove from watchlist
- `GET /api/watchlist/:movieId/check` - Check if in watchlist

## Authentication Flow

1. User signs up/logs in via frontend
2. Backend validates credentials and returns JWT token
3. Token is stored in localStorage
4. Token is sent in Authorization header for protected routes
5. Backend validates token and processes request

## Database Schema

### users
- id (UUID, primary key)
- email (VARCHAR, unique)
- password_hash (VARCHAR)
- created_at, updated_at (TIMESTAMP)

### profiles
- id (UUID, primary key)
- user_id (UUID, foreign key)
- name (VARCHAR)
- avatar_url (VARCHAR)
- is_kids (BOOLEAN)
- created_at, updated_at (TIMESTAMP)

### watched_movies
- id (UUID, primary key)
- profile_id (UUID, foreign key)
- movie_id (INTEGER)
- title (VARCHAR)
- poster_path (VARCHAR)
- watched_at (TIMESTAMP)
- rating (INTEGER, 1-5)

### watchlist
- id (UUID, primary key)
- profile_id (UUID, foreign key)
- movie_id (INTEGER)
- media_type (VARCHAR)
- title (VARCHAR)
- poster_path (VARCHAR)
- added_at (TIMESTAMP)

### user_preferences
- id (UUID, primary key)
- profile_id (UUID, foreign key)
- favorite_genres (TEXT[])
- language (VARCHAR)
- updated_at (TIMESTAMP)

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
```

### Backend (server/.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/movie_library
JWT_SECRET=dev-secret-key
JWT_EXPIRY=7d
PORT=5000
CLIENT_URL=http://localhost:5173
```

## Development

### Frontend Development
```bash
npm run dev      # Start dev server with HMR
npm run build    # Build for production
npm run lint     # Run ESLint
```

### Backend Development
```bash
cd server
npm run dev      # Start server with auto-reload
npm run migrate  # Run database migrations
```

## Production Deployment

1. Set strong `JWT_SECRET` in backend environment
2. Update `CLIENT_URL` to production frontend URL
3. Update `VITE_API_URL` to production API URL
4. Deploy backend to hosting (Railway, Render, etc.)
5. Deploy frontend to hosting (Vercel, Netlify, etc.)
6. Ensure CORS is properly configured in backend

## Migration from Supabase

This project was previously using Supabase for both authentication and database. The migration to PostgreSQL + Express includes:

- ✅ Custom JWT authentication with bcrypt
- ✅ Express API server
- ✅ PostgreSQL database (compatible with Supabase's PostgreSQL)
- ✅ All data models preserved
- ✅ All API endpoints migrated
- ✅ Frontend service layer updated
- ✅ AuthContext refactored for token-based auth

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check PostgreSQL is running
- Ensure database exists: `psql -l | grep movie_library`

### Authentication Issues
- Verify JWT_SECRET is set in .env
- Check token is being stored in localStorage
- Verify API_URL matches server location

### CORS Issues
- Check CLIENT_URL matches frontend origin
- Verify Express CORS middleware is enabled

## License

MIT
