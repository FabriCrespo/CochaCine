/**
 * Home — vitrina editorial.
 * Route: `/`
 *
 * No es el catálogo completo: populares + recorridos por década.
 * El archivo con filtros vive en `/archivo`.
 */

import { useMemo } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router'
import { AppShell } from '../../components/layout/AppShell.tsx'
import { QueryState } from '../../components/feedback/QueryState.tsx'
import {
  CATALOG_DECADES,
  moviesInDecade,
  popularCatalogMovies,
} from '../../lib/catalog.ts'
import { paths } from '../../lib/paths.ts'
import { useBolivianMovies } from '../../query/movies/useBolivianMovies.ts'
import { CatalogHero } from './components/CatalogHero.tsx'
import { HomeDirectors } from './components/HomeDirectors.tsx'
import { HomeReading } from './components/HomeReading.tsx'
import { MovieGrid } from './components/MovieGrid.tsx'
import { MovieRail } from './components/MovieRail.tsx'

export function HomePage() {
  const [searchParams] = useSearchParams()
  if (searchParams.toString()) {
    return <Navigate to={`${paths.archive}?${searchParams.toString()}`} replace />
  }

  return <HomeIndex />
}

function HomeIndex() {
  const { data, isPending, isError, error, refetch } = useBolivianMovies()
  const movies = data?.movies ?? []

  const popular = useMemo(() => popularCatalogMovies(movies), [movies])
  const decades = useMemo(
    () =>
      CATALOG_DECADES.map((decade) => ({
        ...decade,
        movies: moviesInDecade(movies, decade.from, decade.to),
      })).filter((decade) => decade.movies.length > 0),
    [movies],
  )

  return (
    <AppShell title="Bolivian cinema" hero={<CatalogHero />} after={<HomeDirectors />}>
      <QueryState
        isPending={isPending && !data}
        isError={isError}
        error={error}
        isEmpty={popular.length === 0}
        pendingMessage="Loading titles..."
        emptyMessage="No movies left in the catalog."
        onRetry={() => {
          void refetch()
        }}
      >
        <section>
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[0.28em] uppercase text-brand">The house</p>
              <h2 className="mt-2 font-display text-4xl italic text-ivory sm:text-5xl">
                Most beloved
              </h2>
            </div>
            <Link
              to={paths.catalog()}
              className="text-[11px] tracking-[0.18em] uppercase text-muted hover:text-ivory"
            >
              The complete archive
            </Link>
          </div>
          <MovieGrid movies={popular} />
        </section>

        {decades.map((decade) => (
          <div key={decade.id} className="mt-16">
            <MovieRail title={decade.label} movies={decade.movies} />
          </div>
        ))}
      </QueryState>
      <HomeReading />
    </AppShell>
  )
}
