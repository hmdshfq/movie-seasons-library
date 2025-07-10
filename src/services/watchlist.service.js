import { supabase } from '../lib/supabase';

export const watchlistService = {
  async getWatchlist(profileId) {
    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .eq('profile_id', profileId)
      .order('added_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async addToWatchlist(profileId, movie) {
    // movie.media_type should be 'movie' or 'tv'
    const { data, error } = await supabase
      .from('watchlist')
      .insert([
        {
          profile_id: profileId,
          movie_id: movie.id,
          media_type: movie.media_type || 'movie',
          title: movie.title || movie.name,
          poster_path: movie.poster_path,
          added_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();
    if (error) {
      if (error.code === '23505') {
        return { exists: true };
      }
      throw error;
    }
    return data;
  },

  async removeFromWatchlist(profileId, movieId, mediaType = 'movie') {
    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('profile_id', profileId)
      .eq('movie_id', movieId)
      .eq('media_type', mediaType);
    if (error) throw error;
  },
};
