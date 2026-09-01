/**
 * GET /genre/movie/list — genre names in English.
 * Rarely changes: long staleTime.
 */

import { useQuery } from '@tanstack/react-query'
import { fetchMovieGenres } from '../../api/tmdb/movies.api.ts'
import type { AppError } from '../../api/http/errors.ts'
import type { MovieGenre } from '../../domain/movie.ts'
import { movieKeys } from '../keys.ts'

export function useMovieGenres() {
  return useQuery<MovieGenre[], AppError>({
    queryKey: movieKeys.genres(),
    queryFn: fetchMovieGenres,
    staleTime: 24 * 60 * 60 * 1000,
  })
}
