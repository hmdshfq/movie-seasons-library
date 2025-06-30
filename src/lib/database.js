import { supabase } from './supabase';

export const database = {
  // Watched Movies
  async getWatchedMovies(profileId) {
    const { data, error } = await supabase
      .from('watched_movies')
      .select('*')
      .eq('profile_id', profileId)
      .order('watched_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addWatchedMovie(profileId, movie) {
    const { data, error } = await supabase
      .from('watched_movies')
      .insert([{
        profile_id: profileId,
        movie_id: movie.id,
        title: movie.title || movie.name,
        poster_path: movie.poster_path,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeWatchedMovie(profileId, movieId) {
    const { error } = await supabase
      .from('watched_movies')
      .delete()
      .eq('profile_id', profileId)
      .eq('movie_id', movieId);

    if (error) throw error;
  },

  async updateMovieRating(profileId, movieId, rating) {
    const { data, error } = await supabase
      .from('watched_movies')
      .update({ rating })
      .eq('profile_id', profileId)
      .eq('movie_id', movieId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // User Preferences
  async getPreferences(profileId) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('profile_id', profileId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updatePreferences(profileId, preferences) {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert([{
        profile_id: profileId,
        ...preferences,
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};