/**
 * Hero del catálogo: fotograma a sangre, copy de La Hija Cóndor a la derecha.
 */

import { useState } from 'react'
import { Link } from 'react-router'
import {
  CATALOG_HERO_IMAGE,
  TMDB_MOVIE_LA_HIJA_CONDOR,
} from '../../../config/constants.ts'
import { paths } from '../../../lib/paths.ts'
import { usePrefetchMovie } from '../../../query/movies/useMovie.ts'
import { ReleaseDatesModal } from './ReleaseDatesModal.tsx'

export function CatalogHero() {
  const [datesOpen, setDatesOpen] = useState(false)
  const prefetch = usePrefetchMovie()

  return (
    <section className="relative w-full overflow-hidden bg-ink" aria-label="La Hija Cóndor">
      <img
        src={CATALOG_HERO_IMAGE}
        alt=""
        className="h-[min(72vh,36rem)] w-full object-cover object-[28%_42%] sm:h-[min(78vh,42rem)]"
      />
      <div className="pointer-events-none absolute inset-0 bg-ink/8" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-full max-w-2xl bg-linear-to-l from-ink/55 via-ink/20 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-ink to-transparent" />

      <div className="absolute inset-0 flex items-end justify-end px-6 pb-10 sm:items-center sm:px-10 sm:pb-0 lg:px-16">
        <div className="max-w-lg text-right">
          <p className="text-[11px] tracking-[0.32em] uppercase text-brand">Now presenting</p>
          <h2 className="mt-3">
            <Link
              to={paths.movie(TMDB_MOVIE_LA_HIJA_CONDOR)}
              onPointerEnter={() => prefetch(TMDB_MOVIE_LA_HIJA_CONDOR)}
              className="font-display text-5xl italic leading-[0.88] text-ivory sm:text-6xl lg:text-7xl"
            >
              La Hija Cóndor
            </Link>
          </h2>
          <p className="mt-5 font-display text-xl italic leading-snug text-ivory/85 sm:text-2xl">
            the new sensation
            <br />
            of Bolivian cinema
          </p>
          <button
            type="button"
            onClick={() => setDatesOpen(true)}
            className="mt-7 bg-brand px-5 py-2.5 font-sans text-xs tracking-[0.18em] uppercase text-ink hover:bg-brand/90"
          >
            Available dates
          </button>
        </div>
      </div>

      {datesOpen ? (
        <ReleaseDatesModal title="La Hija Cóndor" onClose={() => setDatesOpen(false)} />
      ) : null}
    </section>
  )
}
