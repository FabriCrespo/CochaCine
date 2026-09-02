/**
 * =============================================================================
 * MovieCard
 * =============================================================================
 *
 * Póster como objeto, no tarjeta. Título serif + año muted.
 */

import type { Movie } from '../../../domain/movie.ts'

type MovieCardProps = {
  movie: Movie
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <article>
      {movie.posterUrl ? (
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="aspect-2/3 w-full object-cover"
        />
      ) : (
        <div className="flex aspect-2/3 items-center justify-center bg-ink-soft text-sm text-muted">
          No poster
        </div>
      )}
      <div className="pt-3">
        <h2 className="line-clamp-2 font-serif text-[15px] leading-snug text-ivory">
          {movie.title}
        </h2>
        <p className="mt-1 text-xs tracking-wide text-muted">
          {movie.releaseYear ?? '—'}
        </p>
      </div>
    </article>
  )
}
