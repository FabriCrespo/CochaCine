import type { Movie } from '../../../domain/movie.ts'
import { HorizontalCarousel } from './HorizontalCarousel.tsx'
import { MovieCardLink } from './MovieCard.tsx'

type MovieRailProps = {
  title: string
  movies: Movie[]
}

export function MovieRail({ title, movies }: MovieRailProps) {
  if (movies.length === 0) return null

  return (
    <HorizontalCarousel title={title}>
      {movies.map((movie) => (
        <MovieCardLink
          key={movie.id}
          movie={movie}
          className="w-36 shrink-0 sm:w-40"
        />
      ))}
    </HorizontalCarousel>
  )
}
