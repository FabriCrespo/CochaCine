/**
 * =============================================================================
 * FÁBRICA DE QUERY KEYS (React Query)
 * =============================================================================
 *
 * Cada petición se cachea con un array (queryKey).
 * Misma key = mismos datos. `as const` congela los literales para que
 * TypeScript distinga ['movies'] de ['movies', 'list', 'bolivian', { page: 1 }].
 *
 * Cómo invalidar todo el dominio movies:
 *   queryClient.invalidateQueries({ queryKey: movieKeys.all })
 *
 * Cómo agregar keys de un endpoint nuevo:
 *   detail: (id: number) => [...movieKeys.all, 'detail', id] as const
 */

export const movieKeys = {
  all: ['movies'] as const,
  lists: () => [...movieKeys.all, 'list'] as const,
  bolivian: () => [...movieKeys.lists(), 'bolivian', { catalog: 'client-filters' }] as const,
  director: (personId: number) => [...movieKeys.lists(), 'director', personId] as const,
  genres: () => [...movieKeys.all, 'genres'] as const,
  details: () => [...movieKeys.all, 'detail'] as const,
  detail: (id: number) => [...movieKeys.details(), id, 'supabase-overlay'] as const,
  detailSource: (id: number) => [...movieKeys.details(), id, 'tmdb-imdb'] as const,
}

export const overrideKeys = {
  all: ['overrides'] as const,
  list: () => [...overrideKeys.all, 'list'] as const,
  detail: (id: number) => [...overrideKeys.all, 'detail', id] as const,
}
