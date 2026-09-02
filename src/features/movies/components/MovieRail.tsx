import { Link } from 'react-router'
import type { Movie } from '../../../domain/movie.ts'
import { paths } from '../../../lib/paths.ts'
import { usePrefetchMovie } from '../../../query/movies/useMovie.ts'
import { HorizontalCarousel } from './HorizontalCarousel.tsx'
import { MovieCard } from './MovieCard.tsx'

type MovieRailProps = {
  title: string
  movies: Movie[]
}

export function MovieRail({ title, movies }: MovieRailProps) {
  const prefetch = usePrefetchMovie()
  if (movies.length === 0) return null

  return (
    <HorizontalCarousel title={title}>
      {movies.map((movie) => (
        <Link
          key={movie.id}
          to={paths.movie(movie.id)}
          onPointerEnter={() => prefetch(movie.id)}
          onFocus={() => prefetch(movie.id)}
          className="w-36 shrink-0 outline-none transition-opacity hover:opacity-80 sm:w-40"
        >
          <MovieCard movie={movie} />
        </Link>
      ))}
    </HorizontalCarousel>
  )
}
