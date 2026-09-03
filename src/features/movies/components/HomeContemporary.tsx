/**
 * De los maestros al cine de ahora: tres pósters y un descenso de papel a negro.
 */

import { Link } from 'react-router'
import {
  CONTEMPORARY_CLOSE,
  CONTEMPORARY_FILMS,
  CONTEMPORARY_INTRO,
  type ContemporaryFilm,
} from '../../../config/contemporary.ts'
import type { Movie } from '../../../domain/movie.ts'
import { paths } from '../../../lib/paths.ts'
import { usePrefetchMovie } from '../../../query/movies/useMovie.ts'

type HomeContemporaryProps = {
  movies: Movie[]
}

export function HomeContemporary({ movies }: HomeContemporaryProps) {
  return (
    <section aria-labelledby="lineage-heading">
      <div className="bg-paper px-6 pb-16 pt-8 text-ink sm:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] tracking-[0.28em] uppercase text-ink/50">
            {CONTEMPORARY_INTRO.kicker}
          </p>
          <h2
            id="lineage-heading"
            className="mt-5 font-display text-4xl italic leading-[1.05] text-ink sm:text-5xl lg:text-6xl"
          >
            {CONTEMPORARY_INTRO.title.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <span className="mx-auto mt-8 block h-px w-20 bg-brand" />
          <div className="mt-10 space-y-6 font-serif text-base leading-8 text-ink/75 sm:text-lg sm:leading-9">
            {CONTEMPORARY_INTRO.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="lineage-wash overflow-x-hidden px-6 pb-28 pt-24 text-ivory sm:px-12 lg:px-16 lg:pt-36 lg:pb-32">
        <div className="mx-auto max-w-6xl">
          <ol className="grid list-none gap-y-24 md:grid-cols-3 md:items-start md:gap-x-12 md:gap-y-0 lg:gap-x-20 xl:gap-x-28">
            {CONTEMPORARY_FILMS.map((film, index) => (
              <li key={film.tmdbId} className="min-w-0">
                <FilmColumn
                  film={film}
                  movie={movies.find((entry) => entry.id === film.tmdbId) ?? null}
                  index={index}
                  position={
                    index === 0 ? 'start' : index === CONTEMPORARY_FILMS.length - 1 ? 'end' : 'mid'
                  }
                />
              </li>
            ))}
          </ol>
        </div>

        <div className="mx-auto mt-32 max-w-3xl text-center lg:mt-44">
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand">
            {CONTEMPORARY_CLOSE.kicker}
          </p>
          <h3 className="mt-5 font-display text-5xl italic leading-[1.05] text-ivory sm:text-6xl lg:text-8xl">
            {CONTEMPORARY_CLOSE.title.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h3>
          <span className="mx-auto mt-8 block h-px w-20 bg-brand" />
          <p className="mx-auto mt-8 max-w-xl font-serif text-base leading-8 text-ivory/70 sm:text-lg sm:leading-9">
            {CONTEMPORARY_CLOSE.dek}
          </p>
          <Link
            to={paths.catalog()}
            className="mt-10 inline-block text-[11px] tracking-[0.22em] uppercase text-brand hover:text-ivory"
          >
            The complete archive
          </Link>
        </div>
      </div>
    </section>
  )
}

function FilmColumn({
  film,
  movie,
  index,
  position,
}: {
  film: ContemporaryFilm
  movie: Movie | null
  index: number
  position: 'start' | 'mid' | 'end'
}) {
  const prefetch = usePrefetchMovie()
  const poster = largePosterUrl(movie?.posterUrl ?? null)
  const lineClass =
    position === 'start'
      ? 'md:left-1/2 md:right-0'
      : position === 'end'
        ? 'md:left-0 md:right-1/2'
        : 'md:inset-x-0'

  return (
    <article className="mx-auto flex max-w-sm flex-col items-center text-center md:max-w-none">
      <p className="text-[10px] tracking-[0.36em] text-ivory/30">
        {String(index + 1).padStart(2, '0')}
      </p>
      <p className="mt-5 text-[11px] tracking-[0.28em] uppercase text-brand">{film.year}</p>
      <p className="mt-3 min-h-10 px-1 text-[11px] leading-5 tracking-[0.16em] uppercase text-ivory/55">
        {film.director}
      </p>

      <div className="relative my-10 flex w-full items-center justify-center md:my-12 lg:my-14">
        <span
          className={`pointer-events-none absolute top-1/2 hidden h-px -translate-y-1/2 bg-brand/45 md:block ${lineClass}`}
          aria-hidden
        />
        <span className="relative z-10 block h-1.5 w-1.5 rounded-full bg-brand ring-4 ring-ink" />
      </div>

      <Link
        to={paths.movie(film.tmdbId)}
        onPointerEnter={() => prefetch(film.tmdbId)}
        onFocus={() => prefetch(film.tmdbId)}
        className="group block w-[min(100%,18.5rem)] outline-none focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-brand lg:w-[min(100%,19.5rem)]"
      >
        {poster ? (
          <div className="lineage-poster-frame">
            <img
              src={poster}
              alt={film.title}
              className="lineage-poster aspect-2/3 w-full object-cover"
            />
          </div>
        ) : (
          <div className="lineage-poster-frame flex aspect-2/3 w-full items-center justify-center bg-ink-soft font-display text-2xl italic text-muted">
            {film.title}
          </div>
        )}
        <h3 className="mt-10 min-h-16 font-display text-[1.85rem] italic leading-[1.12] text-ivory transition-colors group-hover:text-brand lg:mt-12 lg:min-h-20 lg:text-[2.15rem]">
          {film.title}
        </h3>
      </Link>

      <p className="mt-5 max-w-68 font-serif text-[15px] leading-8 text-ivory/60 lg:mt-6 lg:max-w-72 lg:leading-8">
        {film.dek}
      </p>
    </article>
  )
}

function largePosterUrl(url: string | null): string | null {
  if (!url) return null
  return url.replace('/w500/', '/w780/')
}
