/**
 * Hero dinámico del home: alterna entre slides editoriales.
 * Slide 1 → La Hija Cóndor (película featured).
 * Slide 2 → Marcos Loayza (perfil de director).
 */

import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  CATALOG_HERO_IMAGE,
  TMDB_MOVIE_LA_HIJA_CONDOR,
} from '../../../config/constants.ts'
import { paths } from '../../../lib/paths.ts'
import { usePrefetchMovie } from '../../../query/movies/useMovie.ts'
import { ReleaseDatesModal } from './ReleaseDatesModal.tsx'

type Slide = {
  id: string
  render: (props: { active: boolean }) => React.ReactNode
}

const CYCLE_MS = 7000

export function CatalogHero() {
  const [index, setIndex] = useState(0)
  const [datesOpen, setDatesOpen] = useState(false)
  const prefetch = usePrefetchMovie()

  const slides: Slide[] = [
    {
      id: 'la-hija-condor',
      render: ({ active }) => (
        <MovieSlide
          active={active}
          prefetch={prefetch}
          onDatesOpen={() => setDatesOpen(true)}
        />
      ),
    },
    {
      id: 'cielo',
      render: ({ active }) => (
        <CieloSlide active={active} prefetch={prefetch} />
      ),
    },
  ]

  const count = slides.length

  const goTo = useCallback(
    (next: number) => setIndex((next % count + count) % count),
    [count],
  )

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => goTo(index + 1), CYCLE_MS)
    return () => window.clearInterval(timer)
  }, [index, goTo])

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className="relative w-full overflow-hidden bg-ink"
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          aria-hidden={i !== index}
          className={`transition-opacity duration-1000 ease-in-out ${
            i === index
              ? 'relative z-10 opacity-100'
              : 'pointer-events-none absolute inset-0 z-0 opacity-0'
          }`}
        >
          {slide.render({ active: i === index })}
        </div>
      ))}

      {/* minimal indicators */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-center gap-3 pb-5">
        {slides.map((slide, i) => (
          <span
            key={slide.id}
            className={`block h-[3px] rounded-full transition-all duration-700 ${
              i === index ? 'w-7 bg-brand' : 'w-1.5 bg-ivory/25'
            }`}
          />
        ))}
      </div>

      {datesOpen ? (
        <ReleaseDatesModal title="La Hija Cóndor" onClose={() => setDatesOpen(false)} />
      ) : null}
    </section>
  )
}

/* ================================================================
   Slide 1 — La Hija Cóndor
   ================================================================ */

function MovieSlide({
  active,
  prefetch,
  onDatesOpen,
}: {
  active: boolean
  prefetch: (id: number) => void
  onDatesOpen: () => void
}) {
  return (
    <div className="relative h-[min(72vh,36rem)] w-full sm:h-[min(78vh,42rem)]">
      <img
        src={CATALOG_HERO_IMAGE}
        alt=""
        className={`h-full w-full object-cover object-[28%_42%] transition-transform duration-[16s] ease-out ${
          active ? 'scale-[1.06]' : 'scale-100'
        }`}
      />
      <div className="pointer-events-none absolute inset-0 bg-ink/8" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-full max-w-2xl bg-linear-to-l from-ink/55 via-ink/20 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-ink to-transparent" />

      <div className="absolute inset-0 flex items-end justify-end px-6 pb-14 sm:items-center sm:px-10 sm:pb-0 lg:px-16">
        <div
          className={`max-w-lg text-right transition-all duration-700 ${
            active ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
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
            onClick={onDatesOpen}
            className="pointer-events-auto mt-7 bg-brand px-5 py-2.5 font-sans text-xs tracking-[0.18em] uppercase text-ink hover:bg-brand/90"
          >
            Available dates
          </button>
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   Slide 2 — Cielo (estreno en cines bolivianos)
   ================================================================ */

const CIELO_IMAGE =
  'https://www.hollywoodreporter.com/wp-content/uploads/2025/05/Cielo-film-still-3-Luchadora-Films.jpg?w=3000'
const CIELO_VARIETY_URL = 'https://variety.com/2025/film/reviews/cielo-review-2-1236476236/'

const TMDB_MOVIE_CIELO = 1443869

function CieloSlide({ active, prefetch }: { active: boolean; prefetch: (id: number) => void }) {
  return (
    <div className="relative h-[min(72vh,36rem)] w-full sm:h-[min(78vh,42rem)]">
      <img
        src={CIELO_IMAGE}
        alt="Still from Cielo — a girl crosses the Bolivian salt flats"
        className={`h-full w-full object-cover object-center transition-transform duration-[16s] ease-out ${
          active ? 'scale-[1.06]' : 'scale-100'
        }`}
        draggable={false}
      />
      <div className="pointer-events-none absolute inset-0 bg-ink/35" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-ink via-ink/70 to-transparent" />

      <div className="absolute inset-0 flex items-end px-6 pb-16 sm:items-center sm:pb-0 lg:px-16">
        <div
          className={`max-w-2xl transition-all duration-700 ${
            active ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <p className="text-[11px] tracking-[0.32em] uppercase text-brand">
            Now in Bolivian cinemas · September 3, 2026
          </p>
          <h2 className="mt-3 font-display text-6xl italic leading-[0.88] text-ivory sm:text-7xl lg:text-8xl">
            Cielo
          </h2>
          <p className="mt-5 font-display text-xl italic leading-snug text-ivory/85 sm:text-2xl">
            Alberto Sciamma's magical-realist pilgrimage
            <br className="hidden sm:block" />
            through the Bolivian highlands
          </p>
          <blockquote className="mt-6 max-w-lg border-l-2 border-brand/60 pl-4 font-serif text-[15px] leading-7 text-ivory/70 italic sm:text-base sm:leading-8">
            "A kinder, gentler Jodorowsky… considerable ambition, aesthetic beauty and bittersweet
            enchantment, with a surprisingly wide viewer appeal."
            <cite className="mt-2 block text-[11px] not-italic tracking-[0.14em] uppercase text-brand/80">
              — Variety
            </cite>
          </blockquote>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Link
              to={paths.movie(TMDB_MOVIE_CIELO)}
              onPointerEnter={() => prefetch(TMDB_MOVIE_CIELO)}
              className="pointer-events-auto inline-block bg-brand px-5 py-2.5 font-sans text-xs tracking-[0.18em] uppercase text-ink hover:bg-brand/90"
            >
              View title
            </Link>
            <a
              href={CIELO_VARIETY_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="pointer-events-auto inline-block border border-ivory/30 px-5 py-2.5 font-sans text-xs tracking-[0.18em] uppercase text-ivory/70 hover:border-ivory hover:text-ivory"
            >
              Variety review
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

