/**
 * Ficha: título, año, director (con foto), género, duración,
 * idiomas, países, sinopsis y trailer.
 */

import { Link } from 'react-router'
import type { MovieDetail } from '../../../domain/movie.ts'
import { formatRuntimeMinutes } from '../../../lib/dates.ts'
import { paths } from '../../../lib/paths.ts'
import { MovieTrailer } from './MovieTrailer.tsx'

type MovieDetailViewProps = {
  movie: MovieDetail
}

export function MovieDetailView({ movie }: MovieDetailViewProps) {
  const runtime = formatRuntimeMinutes(movie.runtimeMinutes)
  const genres = joinList(movie.genres)
  const languages = joinList(movie.languages)
  const countries = joinList(movie.countries)

  return (
    <article>
      <Link
        to={paths.catalog()}
        className="text-sm tracking-[0.2em] uppercase text-brand/80 underline-offset-4 hover:text-brand hover:underline"
      >
        ← Cartelera
      </Link>

      <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,220px)_1fr] md:items-start">
        <div className="mx-auto w-full max-w-56 ring-1 ring-brand/40 md:mx-0">
          {movie.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt=""
              className="aspect-2/3 w-full object-cover"
            />
          ) : (
            <div className="flex aspect-2/3 items-center justify-center bg-ink-soft text-sm text-brand/50">
              Sin póster
            </div>
          )}
        </div>

        <div className="min-w-0">
          <h2 className="font-serif text-3xl tracking-wide text-brand sm:text-4xl">
            {movie.title}
          </h2>

          <div className="mt-8 flex items-start gap-5">
            <div className="h-28 w-20 shrink-0 overflow-hidden bg-ink-soft ring-1 ring-brand/40">
              {movie.director?.photoUrl ? (
                <img
                  src={movie.director.photoUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] tracking-[0.16em] uppercase text-brand/40">
                  Foto
                </div>
              )}
            </div>
            <Fact
              label="Director"
              value={movie.director?.name ?? 'No consta en TMDB'}
            />
          </div>

          <dl className="mt-8 space-y-5">
            <Fact label="Año" value={movie.releaseYear ?? 'Sin fecha'} />
            <Fact label="Duración" value={runtime ?? 'No consta'} />
            <Fact label="Género" value={genres ?? 'No consta'} />
            <Fact label="Idiomas" value={languages ?? 'No consta'} />
            <Fact label="Países" value={countries ?? 'No consta'} />
          </dl>
        </div>
      </div>

      <section className="mt-12 max-w-2xl">
        <h3 className="text-xs tracking-[0.28em] uppercase text-brand/70">
          Sinopsis
        </h3>
        <p className="mt-4 font-serif text-lg leading-8 text-brand/90">
          {movie.overview.trim() ||
            'TMDB no tiene sinopsis en inglés para esta película.'}
        </p>
      </section>

      {movie.trailerYoutubeKey ? (
        <section className="mt-12 max-w-3xl">
          <h3 className="text-xs tracking-[0.28em] uppercase text-brand/70">
            Trailer
          </h3>
          <div className="mt-4">
            <MovieTrailer youtubeKey={movie.trailerYoutubeKey} title={movie.title} />
          </div>
        </section>
      ) : null}
    </article>
  )
}

function joinList(values: string[]): string | null {
  if (values.length === 0) return null
  return values.join(' · ')
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs tracking-[0.24em] uppercase text-brand/55">{label}</dt>
      <dd className="mt-1 font-serif text-2xl text-brand">{value}</dd>
    </div>
  )
}
