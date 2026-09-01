/**
 * =============================================================================
 * BolivianMoviesPage
 * =============================================================================
 *
 * Bolivian film catalog. Search, genre, year and sort live in the URL
 * so they survive a trip to a movie page.
 * Route: `/`
 */

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { AppShell } from '../../components/layout/AppShell.tsx'
import { QueryState } from '../../components/feedback/QueryState.tsx'
import type { CatalogSort } from '../../api/tmdb/sort.ts'
import {
  filterCatalogMovies,
  genresPresentInCatalog,
  sortCatalogMovies,
  yearsPresentInCatalog,
} from '../../lib/catalog.ts'
import {
  catalogSearchString,
  parseCatalogSearch,
  rememberCatalogScroll,
  rememberCatalogView,
  readCatalogScroll,
  type CatalogViewState,
} from '../../lib/catalogSearch.ts'
import { useBolivianMovies } from '../../query/movies/useBolivianMovies.ts'
import { useMovieGenres } from '../../query/movies/useMovieGenres.ts'
import { CatalogControls } from './components/CatalogControls.tsx'
import { MovieGrid } from './components/MovieGrid.tsx'

export function BolivianMoviesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const view = useMemo(
    () => parseCatalogSearch(searchParams.toString()),
    [searchParams],
  )
  const [filtersOpen, setFiltersOpen] = useState(false)

  const { data, isPending, isError, error, refetch } = useBolivianMovies()
  const { data: genres = [] } = useMovieGenres()

  useEffect(() => {
    rememberCatalogView(view)
  }, [view])

  useEffect(() => {
    const saved = readCatalogScroll()
    if (saved != null) {
      window.requestAnimationFrame(() => window.scrollTo(0, saved))
    }

    return () => {
      rememberCatalogScroll(window.scrollY)
    }
  }, [])

  const catalogGenres = useMemo(
    () => genresPresentInCatalog(data?.movies ?? [], genres),
    [data?.movies, genres],
  )

  const catalogYears = useMemo(
    () => yearsPresentInCatalog(data?.movies ?? []),
    [data?.movies],
  )

  const visibleMovies = useMemo(() => {
    const filtered = filterCatalogMovies(
      data?.movies ?? [],
      view.query,
      view.genreIds,
      view.year,
    )
    return sortCatalogMovies(filtered, view.sortBy)
  }, [data?.movies, view])

  const filtersActive = Boolean(
    view.query.trim() || view.genreIds.length > 0 || view.year,
  )

  function patchView(partial: Partial<CatalogViewState>) {
    const next = { ...view, ...partial }
    rememberCatalogView(next)
    const queryString = catalogSearchString(next)
    setSearchParams(queryString ? new URLSearchParams(queryString.slice(1)) : {}, {
      replace: true,
    })
  }

  function toggleGenre(id: number) {
    const genreIds = view.genreIds.includes(id)
      ? view.genreIds.filter((item) => item !== id)
      : [...view.genreIds, id]
    patchView({ genreIds })
  }

  return (
    <AppShell
      title="Bolivian cinema"
      toolbar={
        <CatalogControls
          query={view.query}
          onQueryChange={(query) => patchView({ query })}
          movies={data?.movies ?? []}
          genres={catalogGenres}
          selectedGenreIds={view.genreIds}
          onToggleGenre={toggleGenre}
          onClearGenres={() => patchView({ genreIds: [] })}
          years={catalogYears}
          selectedYear={view.year}
          onYearChange={(year) => patchView({ year })}
          filtersOpen={filtersOpen}
          onToggleFilters={() => setFiltersOpen((open) => !open)}
          onCloseFilters={() => setFiltersOpen(false)}
          sortBy={view.sortBy}
          onSortByChange={(sortBy: CatalogSort) => patchView({ sortBy })}
        />
      }
    >
      {view.genreIds.length > 0 ? (
        <ul className="mb-5 flex flex-wrap gap-2">
          {catalogGenres
            .filter((genre) => view.genreIds.includes(genre.id))
            .map((genre) => (
              <li key={genre.id}>
                <button
                  type="button"
                  onClick={() => toggleGenre(genre.id)}
                  className="bg-ink-soft px-2 py-1 text-xs tracking-[0.12em] uppercase text-brand hover:text-white"
                >
                  {genre.name} ×
                </button>
              </li>
            ))}
        </ul>
      ) : null}

      {data ? (
        <p className="mb-6 text-sm text-brand/70">
          <span className="font-medium text-brand">{visibleMovies.length}</span> of{' '}
          {data.totalResults} titles
          {filtersActive ? ' (filters on)' : ''}.
        </p>
      ) : null}

      <QueryState
        isPending={isPending && !data}
        isError={isError}
        error={error}
        isEmpty={visibleMovies.length === 0}
        pendingMessage="Loading catalog..."
        emptyMessage={
          filtersActive
            ? 'No movies match this search, genre or year.'
            : 'No movies left in the catalog.'
        }
        onRetry={() => {
          void refetch()
        }}
      >
        <MovieGrid movies={visibleMovies} />
      </QueryState>
    </AppShell>
  )
}
