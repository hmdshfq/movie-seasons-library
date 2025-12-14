import express, { Request, Response, NextFunction, Router } from 'express';

const router: Router = express.Router();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

if (!TMDB_API_KEY) {
  console.warn('Warning: TMDB_API_KEY not set in environment variables');
}

// Generic TMDB proxy handler
async function proxyTmdbRequest(endpoint: string, params: Record<string, string | number> = {}): Promise<unknown> {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY || '');

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      url.searchParams.append(key, String(value));
    }
  });

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  return response.json();
}

// Movie endpoints
router.get('/movie/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await proxyTmdbRequest(`/movie/${req.params.id}`);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/search/movie', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, page } = req.query;
    const data = await proxyTmdbRequest('/search/movie', { 
      query: query as string, 
      page: page ? Number(page) : 1 
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/discover/movie', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params: Record<string, string | number> = {};
    Object.entries(req.query).forEach(([key, value]) => {
      if (value) {
        params[key] = typeof value === 'string' ? value : Number(value);
      }
    });
    const data = await proxyTmdbRequest('/discover/movie', params);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/movie/:id/recommendations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await proxyTmdbRequest(`/movie/${req.params.id}/recommendations`);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/movie/:id/similar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await proxyTmdbRequest(`/movie/${req.params.id}/similar`);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/movie/:id/videos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await proxyTmdbRequest(`/movie/${req.params.id}/videos`);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/trending/movie/:timeWindow', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { timeWindow } = req.params;
    const data = await proxyTmdbRequest(`/trending/movie/${timeWindow}`);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// TV endpoints
router.get('/tv/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await proxyTmdbRequest(`/tv/${req.params.id}`);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/tv/:id/videos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await proxyTmdbRequest(`/tv/${req.params.id}/videos`);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/search/tv', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, page } = req.query;
    const data = await proxyTmdbRequest('/search/tv', { 
      query: query as string, 
      page: page ? Number(page) : 1 
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/discover/tv', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params: Record<string, string | number> = {};
    Object.entries(req.query).forEach(([key, value]) => {
      if (value) {
        params[key] = typeof value === 'string' ? value : Number(value);
      }
    });
    const data = await proxyTmdbRequest('/discover/tv', params);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Multi-search
router.get('/search/multi', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = req.query;
    const data = await proxyTmdbRequest('/search/multi', { query: query as string });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Genres
router.get('/genre/movie/list', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await proxyTmdbRequest('/genre/movie/list');
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/genre/tv/list', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await proxyTmdbRequest('/genre/tv/list');
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;

