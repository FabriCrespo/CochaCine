/**
 * =============================================================================
 * CATÁLOGO DE ENDPOINTS DE TMDB
 * =============================================================================
 *
 * Las URLs viven acá, no hardcodeadas en cada función.
 * Primer paso al agregar un endpoint: registrarlo aquí.
 *
 * Ejemplo GET /movie/{id}:
 *   detail: (id: number) => `/movie/${id}`
 *
 * Los paths son relativos a TMDB_API_BASE_URL (axios ya tiene baseURL).
 */

export const TMDB_ENDPOINTS = {
  movies: {
    discover: '/discover/movie',
    search: '/search/movie',
    find: (externalId: string) => `/find/${externalId}`,
    detail: (id: number) => `/movie/${id}`,
    videos: (id: number) => `/movie/${id}/videos`,
    images: (id: number) => `/movie/${id}/images`,
  },
  genres: {
    movieList: '/genre/movie/list',
  },
  people: {
    movieCredits: (id: number) => `/person/${id}/movie_credits`,
  },
} as const
