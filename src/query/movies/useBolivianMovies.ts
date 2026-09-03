/**
 * Catálogo completo. El orden y los filtros se aplican en la página, no acá.
 */

import { useQuery } from '@tanstack/react-query'
import { fetchBolivianMovies } from '../../api/tmdb/movies.api.ts'
import type { AppError } from '../../api/http/errors.ts'
import type { PopularMoviesPage } from '../../domain/movie.ts'
import { movieKeys } from '../keys.ts'

export function useBolivianMovies(options: { includeHidden?: boolean } = {}) {
  const includeHidden = Boolean(options.includeHidden)
  return useQuery<PopularMoviesPage, AppError>({
    queryKey: movieKeys.bolivian(includeHidden),
    queryFn: () => fetchBolivianMovies({ includeHidden }),
  })
}
