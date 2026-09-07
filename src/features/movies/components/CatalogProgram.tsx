/**
 * A rotating door in the archive: one title, a few ways in.
 * Pauses on hover. Reduced motion keeps today’s pick still.
 */

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import type { Movie, MovieGenre } from '../../../domain/movie.ts'
import { archiveSpotlightMovies, cardDirectorName } from '../../../lib/catalog.ts'
import { paths } from '../../../lib/paths.ts'
import { usePrefetchMovie } from '../../../query/movies/useMovie.ts'

type CatalogProgramProps = {
  movies: Movie[]
  belovedIds: number[]
  genres: MovieGenre[]
  years: string[]
  onPickGenre: (id: number) => void
  onPickYear: (year: string) => void
}

type Door = { kind: 'genre'; id: number; label: string } | { kind: 'year'; id: string; label: string }

const ROTATE_MS = 8000

export function CatalogProgram({
  movies,
  belovedIds,
  genres,
  years,
  onPickGenre,
  onPickYear,
}: CatalogProgramProps) {
  const doors = useMemo(() => archiveSpotlightMovies(movies, belovedIds), [movies, belovedIds])
  const tries = useMemo(() => buildTries(genres, years), [genres, years])
  const [index, setIndex] = useState(() => Math.floor(Date.now() / 86_400_000))
  const [paused, setPaused] = useState(false)
  const prefetch = usePrefetchMovie()

  const film = doors.length > 0 ? doors[index % doors.length] : null
  const trySet = rotateTries(tries, index)

  useEffect(() => {
    if (doors.length < 2 || paused) return
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const timer = window.setInterval(() => {
      setIndex((current) => current + 1)
    }, ROTATE_MS)

    return () => window.clearInterval(timer)
  }, [doors.length, paused])

  if (!film) return null

  const director = cardDirectorName(film)

  return (
    <aside
      className="mt-8 mb-2 grid gap-8 border-b border-ivory/10 pb-10 md:grid-cols-[minmax(0,8.5rem)_1fr] md:items-end md:gap-10"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <Link
        to={paths.movie(film.id)}
        onPointerEnter={() => prefetch(film.id)}
        onFocus={() => prefetch(film.id)}
        className="group block outline-none focus-visible:ring-1 focus-visible:ring-brand"
      >
        {film.posterUrl ? (
          <img
            key={film.id}
            src={film.posterUrl}
            alt=""
            className="aspect-2/3 w-28 object-cover sm:w-32 md:w-full"
          />
        ) : null}
      </Link>

      <div className="min-w-0">
        <p className="text-[11px] tracking-[0.28em] uppercase text-brand">A door in the stacks</p>
        <Link
          to={paths.movie(film.id)}
          onPointerEnter={() => prefetch(film.id)}
          className="mt-3 block outline-none focus-visible:ring-1 focus-visible:ring-brand"
        >
          <h2
            key={film.id}
            className="font-display text-4xl italic leading-[1.02] text-ivory transition-colors duration-500 hover:text-brand sm:text-5xl"
          >
            {film.title}
          </h2>
        </Link>
        {director ? (
          <p className="mt-2 font-serif text-sm italic text-ivory/50">{director}</p>
        ) : null}
        <p className="mt-2 text-[11px] tracking-[0.16em] uppercase text-muted">
          {film.releaseYear ?? ''}
        </p>

        {trySet.length > 0 ? (
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            {trySet.map((door, slot) => (
              <li key={`${slot}-${door.kind}-${String(door.id)}`}>
                <button
                  type="button"
                  onClick={() =>
                    door.kind === 'genre' ? onPickGenre(door.id) : onPickYear(door.id)
                  }
                  className="text-[11px] tracking-[0.16em] uppercase text-ivory/55 hover:text-brand"
                >
                  {door.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </aside>
  )
}

function buildTries(genres: MovieGenre[], years: string[]): Door[] {
  const genreDoors: Door[] = genres.slice(0, 8).map((genre) => ({
    kind: 'genre',
    id: genre.id,
    label: genre.name,
  }))
  const yearDoors: Door[] = years.slice(0, 6).map((year) => ({
    kind: 'year',
    id: year,
    label: year,
  }))
  const mixed: Door[] = []
  const max = Math.max(genreDoors.length, yearDoors.length)
  for (let i = 0; i < max; i += 1) {
    if (genreDoors[i]) mixed.push(genreDoors[i])
    if (yearDoors[i]) mixed.push(yearDoors[i])
  }
  return mixed
}

function rotateTries(doors: Door[], index: number): Door[] {
  if (doors.length === 0) return []
  const start = index % doors.length
  return [0, 1, 2].map((offset) => doors[(start + offset) % doors.length])
}
