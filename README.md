# MOSE — Movies and Shows Explorer

A React + Vite application for tracking and managing movies with a custom Express API backend and PostgreSQL database.

## Architecture

- **Frontend**: React 18, Vite, TailwindCSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL
- **Authentication**: JWT-based custom authentication with bcrypt password hashing

## Project Structure

This is a monorepo using pnpm workspaces with two main applications:

```
movie-library/
├── apps/
│   ├── client/                   # React frontend (Vite)
│   │   ├── src/
│   │   │   ├── components/       # React components
│   │   │   │   ├── Layout/       # Header, navigation (responsive)
│   │   │   │   ├── MovieGrid/    # Movie display grid component
│   │   │   │   ├── MovieCarousel/# Scrollable carousel for recommendations
│   │   │   │   ├── Tabs/         # Tab components (Discover, Library, Recommendations)
│   │   │   │   └── ...
│   │   │   ├── contexts/         # React contexts (Auth, Watchlist)
│   │   │   ├── lib/              # Utility libraries (api client)
│   │   │   ├── services/         # API service layer
│   │   │   ├── utils/            # Utility functions (icons, helpers)
│   │   │   └── main.jsx
│   │   ├── index.html
│   │   ├── vite.config.js
│   │   ├── tailwind.config.js
│   │   └── package.json
│   └── server/                   # Express backend
│       ├── src/
│       │   ├── controllers/      # Route handlers
│       │   ├── middleware/       # Express middleware (auth)
│       │   ├── routes/           # API routes
│       │   ├── utils/            # JWT utilities
│       │   ├── db.js             # Database connection
│       │   └── index.js          # Express app + static serving
│       ├── db/
│       │   ├── schema.sql        # Database schema
│       │   └── migrate.js        # Migration runner
│       └── package.json
├── package.json                  # Root workspace config
├── pnpm-workspace.yaml          # Workspace definition
├── railway.json                 # Railway deployment config
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

### 2. Install Dependencies (Monorepo)

```bash
# From project root - installs for all apps
pnpm install
```

### 3. Backend Setup

```bash
# Create .env file for backend
cp .env.example apps/server/.env

# Update .env with your database connection string
# DATABASE_URL=postgresql://user:password@host:port/movie_library
# JWT_SECRET=your-secret-key-change-in-production
```

Run migrations:
```bash
pnpm migrate
```

### 4. Frontend Setup

```bash
# Create .env file for frontend
cp .env.example apps/client/.env

# .env should contain:
# VITE_API_URL=http://localhost:5001
# VITE_TMDB_API_KEY=your_api_key
```

### 5. Development

Start both frontend and backend with auto-reload:

```bash
# From project root - starts both server and client
pnpm dev
```

- Backend: `http://localhost:5001`
- Frontend: `http://localhost:5173`

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

### TMDB Integration
- `GET /api/tmdb/movie/:id` - Get movie details
- `GET /api/tmdb/search/movie` - Search movies
- `GET /api/tmdb/discover/movie` - Discover movies with filters
- `GET /api/tmdb/movie/:id/recommendations` - Get recommended movies
- `GET /api/tmdb/movie/:id/similar` - Get similar movies
- `GET /api/tmdb/trending/movie/:timeWindow` - Get trending movies (day/week)
- `GET /api/tmdb/genre/movie/list` - Get movie genres

## Recommendations System

The app provides personalized movie recommendations based on user activity and preferences:

### Algorithm Features
- **Highly Rated Recommendations**: Uses movies rated 4-5 stars to find similar movies you might enjoy
- **Recent Watches**: Suggests movies similar to your recent watch history
- **Genre-Based Trending**: Shows trending movies in your favorite genres
- **Top Rated by Genre**: Displays highly-rated movies in your preferred genres

### Filtering Applied
- Excludes already-watched movies
- Excludes movies in your watchlist
- Respects horror content preference (`hide_horror`)
- Applies kids profile restrictions (`is_kids_profile`)

### Components
- **MovieCarousel** (`apps/client/src/components/MovieCarousel/`): Horizontal scrolling carousel for recommendation sections with smooth navigation and loading states
- **RecommendationsTab** (`apps/client/src/components/Tabs/`): Main recommendations interface with multiple carousel sections

### Backend Service Methods
- `getSimilarMovies()` - Get movies similar to a specific movie
- `getTrendingMovies()` - Fetch trending movies for a time window
- `discoverByGenreAndRating()` - Find highly-rated movies in specific genres

## Responsive Design

Navigation adapts seamlessly across all device sizes:

### Desktop (lg: 1024px+)
- Full navigation with labels and icons
- All tabs visible with descriptive labels
- User menu with expanded profile view

### Tablet (sm: 640px - md: 768px)
- Icon-only navigation buttons
- Hover tooltips show tab labels
- Compact spacing to preserve screen real estate

### Mobile (< 640px)
- Hamburger menu (Menu/X icon)
- Slide-out navigation drawer with full-width buttons
- Simplified header layout (logo + hamburger)
- Touch-friendly button sizes (min 44px)
- Overlay backdrop when menu is open

### Components
- **Header** (`apps/client/src/components/Layout/Header.jsx`): Responsive layout with breakpoint-specific navigation
- **MobileNav** (`apps/client/src/components/Layout/MobileNav.jsx`): Hamburger menu and slide-out drawer for mobile
- **navIcons** (`apps/client/src/utils/navIcons.js`): Icon mapping utility for navigation buttons

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
- favorite_genres (INTEGER[]) - Array of genre IDs from TMDB
- language (VARCHAR)
- hide_horror (BOOLEAN) - Whether to hide horror content
- updated_at (TIMESTAMP)

## Environment Variables

### Frontend (apps/client/.env)
```
VITE_API_URL=http://localhost:5001
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
```

### Backend (apps/server/.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/movie_library
JWT_SECRET=dev-secret-key
JWT_EXPIRY=7d
PORT=5001
CLIENT_URL=http://localhost:5173
```

## Development

```bash
# Start both frontend and backend with auto-reload
pnpm dev

# Or run individually:
pnpm --filter client dev      # Frontend only
pnpm --filter server dev      # Backend only

# Build frontend only
pnpm --filter client build

# Run linting
pnpm lint

# Run database migrations
pnpm migrate
```

## Production Deployment

### Railway Deployment (Recommended)

This monorepo is configured for single-service deployment on Railway using a `Procfile`. Railway will:

1. Detect `Procfile` for build and start commands
2. Install dependencies: `pnpm install`
3. Build frontend: `pnpm build` (builds both client and server)
4. Start server: `pnpm start` (Express serves both API and static files)

**Setup on Railway:**

1. Create Railway project and PostgreSQL database
2. Link your repository
3. Set environment variables:
   ```
   DATABASE_URL=<railway-postgres-url>
   JWT_SECRET=<strong-random-secret>
   JWT_EXPIRY=7d
   NODE_ENV=production
   VITE_API_URL=https://<your-railway-app>.up.railway.app
   VITE_TMDB_API_KEY=<your-tmdb-key>
   VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
   ```
4. Deploy - Railway detects `Procfile` and runs the web process
5. Visit your Railway app URL to access the frontend

**After first deployment (run migration):**
```bash
# Get a Railway CLI connection or use their web terminal
pnpm migrate
```

**Procfile:**
```
web: pnpm install && pnpm build && pnpm start
```

### Other Deployment Options

For separate deployments:

1. **Backend** (Railway, Render, Heroku):
   - Root: `apps/server`
   - Build: `pnpm install && pnpm build`
   - Start: `pnpm start`

2. **Frontend** (Vercel, Netlify):
   - Root: `apps/client`
   - Build: `pnpm build`
   - Output: `dist/`
   - Set `VITE_API_URL` to production API URL

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
