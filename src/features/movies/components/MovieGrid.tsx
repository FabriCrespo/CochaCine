/**
 * MovieGrid
 *
 * Recibe Movie[] ya mapeadas. Prefetch al hover: cuando abrís la ficha,
 * React Query a menudo ya tiene el GET.
 */

import type { Movie } from '../../../domain/movie.ts'
import { MovieCardLink } from './MovieCard.tsx'

type MovieGridProps = {
  movies: Movie[]
}

export function MovieGrid({ movies }: MovieGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-12 md:grid-cols-4 lg:grid-cols-5">
      {movies.map((movie) => (
        <li key={movie.id} className="relative z-0 hover:z-10">
          <MovieCardLink movie={movie} />
        </li>
      ))}
    </ul>
  )
}
