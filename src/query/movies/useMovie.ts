/**
 * =============================================================================
 * HOOK: useMovie
 * =============================================================================
 *
 * GET /movie/{id} con créditos, trailer y plataformas.
 * `enabled: id > 0` evita disparar el GET si la URL todavía no es un id.
 *
 * placeholderData: si venís del catálogo, el póster y el título aparecen
 * al toque desde el cache del listado mientras llega el detalle.
 */

import { useCallback } from 'react'
import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { fetchMovieById } from '../../api/tmdb/movies.api.ts'
import type { AppError } from '../../api/http/errors.ts'
import type { MovieDetail, PopularMoviesPage } from '../../domain/movie.ts'
import { movieKeys } from '../keys.ts'

function emptyWatch() {
  return {
    region: 'BO' as const,
    stream: [],
    rent: [],
    buy: [],
    justWatchUrl: null,
  }
}

function movieFromListCache(queryClient: QueryClient, id: number): MovieDetail | undefined {
  const lists = queryClient.getQueriesData<PopularMoviesPage>({
    queryKey: movieKeys.lists(),
  })

  for (const [, page] of lists) {
    const listed = page?.movies.find((movie) => movie.id === id)
    if (!listed) continue

    return {
      ...listed,
      originalTitle: listed.originalTitle,
      tagline: null,
      runtimeMinutes: null,
      genres: [],
      languages: [],
      countries: [],
      backdropUrl: null,
      voteCount: listed.voteCount,
      director: null,
      writers: [],
      productionCompanies: [],
      releaseDate: null,
      certification: null,
      highlights: [],
      cast: [],
      trailerYoutubeKey: null,
      watch: emptyWatch(),
    }
  }

  return undefined
}

export function useMovie(id: number) {
  const queryClient = useQueryClient()

  return useQuery<MovieDetail, AppError>({
    queryKey: movieKeys.detail(id),
    queryFn: () => fetchMovieById(id),
    enabled: id > 0,
    placeholderData: () => movieFromListCache(queryClient, id),
  })
}

export function usePrefetchMovie() {
  const queryClient = useQueryClient()

  return useCallback(
    (id: number) => {
      if (id <= 0) return

      void queryClient.prefetchQuery({
        queryKey: movieKeys.detail(id),
        queryFn: () => fetchMovieById(id),
      })
    },
    [queryClient],
  )
}
