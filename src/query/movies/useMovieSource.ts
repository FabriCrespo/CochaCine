import { useQuery } from '@tanstack/react-query'
import { fetchMovieByIdFromSources } from '../../api/tmdb/movies.api.ts'
import type { AppError } from '../../api/http/errors.ts'
import type { MovieDetail } from '../../domain/movie.ts'
import { movieKeys } from '../keys.ts'

export function useMovieSource(id: number) {
  return useQuery<MovieDetail, AppError>({
    queryKey: movieKeys.detailSource(id),
    queryFn: () => fetchMovieByIdFromSources(id),
    enabled: id > 0,
  })
}
