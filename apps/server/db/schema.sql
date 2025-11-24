-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  avatar_url VARCHAR(255),
  is_kids BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Watched movies table
CREATE TABLE IF NOT EXISTS watched_movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  title VARCHAR(255),
  poster_path VARCHAR(255),
  watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  UNIQUE(profile_id, movie_id)
);

-- Watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  media_type VARCHAR(50) DEFAULT 'movie',
  title VARCHAR(255),
  poster_path VARCHAR(255),
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(profile_id, movie_id, media_type)
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  favorite_genres TEXT[],
  language VARCHAR(50),
  hide_horror BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(profile_id)
);

-- Add new columns to existing tables if they don't exist
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS hide_horror BOOLEAN DEFAULT FALSE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_watched_movies_profile_id ON watched_movies(profile_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_profile_id ON watchlist(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_profile_id ON user_preferences(profile_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
