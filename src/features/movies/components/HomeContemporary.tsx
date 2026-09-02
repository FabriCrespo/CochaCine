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

      <div className="lineage-wash overflow-x-hidden px-6 pb-24 pt-28 text-ivory sm:px-10 lg:pt-32">
        <div className="mx-auto max-w-7xl">
          <ol className="relative grid list-none gap-16 md:grid-cols-3 md:gap-8 lg:gap-14">
            <span
              className="pointer-events-none absolute top-[4.35rem] right-[16.5%] left-[16.5%] hidden h-px bg-brand/50 md:block"
              aria-hidden
            />
            {CONTEMPORARY_FILMS.map((film, index) => (
              <li key={film.tmdbId}>
                <FilmColumn
                  film={film}
                  movie={movies.find((entry) => entry.id === film.tmdbId) ?? null}
                  lift={index === 1}
                />
              </li>
            ))}
          </ol>
        </div>

        <div className="mx-auto mt-28 max-w-3xl text-center lg:mt-40">
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
  lift,
}: {
  film: ContemporaryFilm
  movie: Movie | null
  lift: boolean
}) {
  const prefetch = usePrefetchMovie()
  const poster = largePosterUrl(movie?.posterUrl ?? null)

  return (
    <article className="text-center">
      <p className="text-[11px] tracking-[0.28em] uppercase text-brand">{film.year}</p>
      <p className="mt-3 text-[11px] tracking-[0.16em] uppercase text-ivory/60">{film.director}</p>
        <span className="relative z-10 mx-auto mt-5 block h-1.5 w-1.5 rounded-full bg-brand" />

      <Link
        to={paths.movie(film.tmdbId)}
        onPointerEnter={() => prefetch(film.tmdbId)}
        onFocus={() => prefetch(film.tmdbId)}
        className={`group mt-8 block outline-none focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-brand ${
          lift ? 'md:-translate-y-6 lg:-translate-y-10' : ''
        }`}
      >
        {poster ? (
          <img
            src={poster}
            alt={film.title}
            className="lineage-poster mx-auto aspect-2/3 w-full max-w-md object-cover md:max-w-none"
          />
        ) : (
          <div className="mx-auto flex aspect-2/3 w-full max-w-md items-center justify-center bg-ink-soft font-display text-2xl italic text-muted md:max-w-none">
            {film.title}
          </div>
        )}
        <h3 className="mt-7 font-display text-3xl italic leading-tight text-ivory transition-colors group-hover:text-brand lg:text-4xl">
          {film.title}
        </h3>
      </Link>

      <p
        className={`mx-auto mt-4 max-w-sm font-serif text-sm leading-7 text-ivory/65 lg:text-[15px] lg:leading-8 ${
          lift ? 'md:-translate-y-6 lg:-translate-y-10' : ''
        }`}
      >
        {film.dek}
      </p>
    </article>
  )
}

function largePosterUrl(url: string | null): string | null {
  if (!url) return null
  return url.replace('/w500/', '/w780/')
}
