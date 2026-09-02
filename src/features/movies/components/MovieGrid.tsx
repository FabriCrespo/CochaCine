/**
 * =============================================================================
 * MovieGrid
 * =============================================================================
 *
 * Recibe Movie[] ya mapeadas. Prefetch al hover: cuando abrís la ficha,
 * React Query a menudo ya tiene el GET.
 */

import { Link } from 'react-router'
import type { Movie } from '../../../domain/movie.ts'
import { paths } from '../../../lib/paths.ts'
import { usePrefetchMovie } from '../../../query/movies/useMovie.ts'
import { MovieCard } from './MovieCard.tsx'

type MovieGridProps = {
  movies: Movie[]
}

export function MovieGrid({ movies }: MovieGridProps) {
  const prefetchMovie = usePrefetchMovie()

  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-12 md:grid-cols-4 lg:grid-cols-5">
      {movies.map((movie) => (
        <li key={movie.id}>
          <Link
            to={paths.movie(movie.id)}
            onPointerEnter={() => prefetchMovie(movie.id)}
            onFocus={() => prefetchMovie(movie.id)}
            className="block outline-none transition-opacity hover:opacity-80 focus-visible:opacity-100 focus-visible:ring-1 focus-visible:ring-brand"
          >
            <MovieCard movie={movie} />
          </Link>
        </li>
      ))}
    </ul>
  )
}
