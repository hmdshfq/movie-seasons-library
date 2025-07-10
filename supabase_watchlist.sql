-- Watchlist table for user profiles
CREATE TABLE watchlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  poster_path VARCHAR(255),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(profile_id, movie_id)
);

-- Enable Row Level Security
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- RLS Policy for watchlist
CREATE POLICY "Users can manage own watchlist" ON watchlist
  FOR ALL USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );
