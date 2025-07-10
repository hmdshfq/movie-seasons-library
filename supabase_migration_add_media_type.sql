-- Migration: Add media_type to watchlist
ALTER TABLE watchlist ADD COLUMN media_type VARCHAR(10) DEFAULT 'movie';

-- Optional: Update existing rows if you have TV shows already (otherwise, all will default to 'movie')
-- UPDATE watchlist SET media_type = 'movie' WHERE media_type IS NULL;

-- Update unique constraint to include media_type
ALTER TABLE watchlist DROP CONSTRAINT watchlist_profile_id_movie_id_key;
ALTER TABLE watchlist ADD CONSTRAINT watchlist_profile_id_movie_id_media_type_key UNIQUE (profile_id, movie_id, media_type);
