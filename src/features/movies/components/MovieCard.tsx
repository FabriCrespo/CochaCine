/**
 * =============================================================================
 * MovieCard
 * =============================================================================
 *
 * Tarjeta de una película del dominio (Movie), NUNCA del DTO de TMDB.
 * Si intentas pasar vote_average, TypeScript no te deja.
 */

import type { Movie } from '../../../domain/movie.ts'

type MovieCardProps = {
  movie: Movie
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <article className="overflow-hidden bg-ink-soft ring-1 ring-brand/35">
      {movie.posterUrl ? (
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="aspect-2/3 w-full object-cover"
        />
      ) : (
        <div className="flex aspect-2/3 items-center justify-center bg-ink text-sm text-brand/50">
          No poster
        </div>
      )}
      <div className="p-3">
        <h2 className="line-clamp-2 text-sm font-medium text-brand">{movie.title}</h2>
        <p className="mt-1 text-xs text-brand/80">
          {movie.releaseYear ?? '—'} · {movie.rating.toFixed(1)}
        </p>
      </div>
    </article>
  )
}
