import { supabase } from '../lib/supabase';

export const movieService = {
  async getWatchedMovies(profileId) {
    const { data, error } = await supabase
      .from('watched_movies')
      .select('*')
      .eq('profile_id', profileId)
      .order('watched_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addWatchedMovie(profileId, movie) {
    const { data, error } = await supabase
      .from('watched_movies')
      .insert([{
        profile_id: profileId,
        movie_id: movie.id,
        title: movie.title || movie.name,
        poster_path: movie.poster_path,
        watched_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      // Handle duplicate entry
      if (error.code === '23505') {
        return { exists: true };
      }
      throw error;
    }
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
      .update({
        rating,
        updated_at: new Date().toISOString()
      })
      .eq('profile_id', profileId)
      .eq('movie_id', movieId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getMovieStats(profileId) {
    const { data, error } = await supabase
      .from('watched_movies')
      .select('*')
      .eq('profile_id', profileId);

    if (error) throw error;

    const stats = {
      totalWatched: data.length,
      averageRating: 0,
      genreDistribution: {},
      watchedThisMonth: 0,
      watchedThisYear: 0
    };

    if (data.length > 0) {
      const ratedMovies = data.filter(m => m.rating);
      if (ratedMovies.length > 0) {
        stats.averageRating = ratedMovies.reduce((sum, m) => sum + m.rating, 0) / ratedMovies.length;
      }

      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      data.forEach(movie => {
        const watchedDate = new Date(movie.watched_at);
        if (watchedDate.getFullYear() === thisYear) {
          stats.watchedThisYear++;
          if (watchedDate.getMonth() === thisMonth) {
            stats.watchedThisMonth++;
          }
        }
      });
    }

    return stats;
  }
};