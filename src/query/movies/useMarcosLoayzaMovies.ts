import { useQuery } from '@tanstack/react-query'
import { fetchMarcosLoayzaMovies } from '../../api/tmdb/movies.api.ts'
import type { AppError } from '../../api/http/errors.ts'
import type { Movie } from '../../domain/movie.ts'
import { TMDB_PERSON_MARCOS_LOAYZA } from '../../config/constants.ts'
import { movieKeys } from '../keys.ts'

export function useMarcosLoayzaMovies() {
  return useQuery<Movie[], AppError>({
    queryKey: movieKeys.director(TMDB_PERSON_MARCOS_LOAYZA),
    queryFn: fetchMarcosLoayzaMovies,
  })
}
