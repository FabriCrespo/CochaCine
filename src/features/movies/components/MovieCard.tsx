/**
 * Póster as a print object: title, director, year · genre.
 * Hover (fine pointer only): 1.03 scale, overlay, play, a line of copy.
 */

import { Link } from 'react-router'
import type { Movie } from '../../../domain/movie.ts'
import { cardDirectorName, primaryGenreName } from '../../../lib/catalog.ts'
import { paths } from '../../../lib/paths.ts'
import { useMovieGenres } from '../../../query/movies/useMovieGenres.ts'
import { usePrefetchMovie } from '../../../query/movies/useMovie.ts'

type MovieCardProps = {
  movie: Movie
}

type MovieCardLinkProps = {
  movie: Movie
  className?: string
}

export function MovieCardLink({ movie, className }: MovieCardLinkProps) {
  const prefetchMovie = usePrefetchMovie()

  return (
    <Link
      to={paths.movie(movie.id)}
      onPointerEnter={() => prefetchMovie(movie.id)}
      onFocus={() => prefetchMovie(movie.id)}
      className={`group block outline-none focus-visible:ring-1 focus-visible:ring-brand ${className ?? ''}`}
    >
      <MovieCard movie={movie} />
    </Link>
  )
}

export function MovieCard({ movie }: MovieCardProps) {
  const { data: genres = [] } = useMovieGenres()
  const director = cardDirectorName(movie)
  const genre = primaryGenreName(movie, genres)
  const facts = [movie.releaseYear, genre].filter(Boolean).join(' · ')
  const teaser = cardTeaser(movie.overview)

  return (
    <article className="title-card">
      <div className="title-card-poster relative bg-ink-soft">
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="aspect-2/3 w-full object-cover"
          />
        ) : (
          <div className="flex aspect-2/3 items-center justify-center text-sm text-muted">
            No poster
          </div>
        )}
        <div className="title-card-overlay pointer-events-none absolute inset-0 flex flex-col items-center justify-end bg-linear-to-t from-ink via-ink/45 to-ink/10 px-3 pb-3.5 pt-10">
          <span className="title-card-play mb-auto mt-10 flex h-11 w-11 items-center justify-center rounded-full border border-brand/80 text-brand">
            <PlayGlyph />
          </span>
          {teaser ? (
            <p className="title-card-copy line-clamp-3 w-full font-serif text-[13px] leading-5 text-ivory/85">
              {teaser}
            </p>
          ) : (
            <p className="title-card-copy w-full text-[10px] tracking-[0.2em] uppercase text-brand">
              View title
            </p>
          )}
        </div>
      </div>
      <div className="pt-3">
        <h2 className="line-clamp-2 font-serif text-[15px] leading-snug text-ivory">
          {movie.title}
        </h2>
        {director ? (
          <p className="mt-1 line-clamp-1 font-serif text-[13px] italic text-ivory/50">{director}</p>
        ) : null}
        {facts ? (
          <p className="mt-1 text-[11px] tracking-[0.14em] uppercase text-muted">{facts}</p>
        ) : null}
      </div>
    </article>
  )
}

function cardTeaser(overview: string): string {
  const text = overview.trim()
  if (text.length < 24) return ''
  return text
}

function PlayGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4 fill-current" aria-hidden>
      <path d="M8 5.5v13l11-6.5z" />
    </svg>
  )
}
