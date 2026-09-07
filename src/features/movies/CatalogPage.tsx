/**
 * Archive — catálogo completo con búsqueda, género, año y orden.
 * Route: `/archivo`
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { AppShell } from '../../components/layout/AppShell.tsx'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs.tsx'
import { Pagination } from '../../components/layout/Pagination.tsx'
import { QueryState } from '../../components/feedback/QueryState.tsx'
import type { CatalogSort } from '../../api/tmdb/sort.ts'
import {
  filterCatalogMovies,
  genresPresentInCatalog,
  sortCatalogMovies,
  decadesPresentInCatalog,
  yearsPresentInCatalog,
} from '../../lib/catalog.ts'
import { paginate, ARCHIVE_PAGE_SIZE } from '../../lib/pagination.ts'
import { paths } from '../../lib/paths.ts'
import {
  catalogSearchString,
  parseCatalogSearch,
  rememberCatalogScroll,
  rememberCatalogView,
  readCatalogScroll,
  type CatalogViewState,
} from '../../lib/catalogSearch.ts'
import { useBolivianMovies } from '../../query/movies/useBolivianMovies.ts'
import { useCatalogHouse } from '../../query/house/useCatalogHouse.ts'
import { useMovieGenres } from '../../query/movies/useMovieGenres.ts'
import { CatalogControls, CatalogMobileFilters } from './components/CatalogControls.tsx'
import { CatalogProgram } from './components/CatalogProgram.tsx'
import { MovieGrid } from './components/MovieGrid.tsx'

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const view = useMemo(
    () => parseCatalogSearch(searchParams.toString()),
    [searchParams],
  )
  const [filtersOpen, setFiltersOpen] = useState(false)

  const { data, isPending, isError, error, refetch } = useBolivianMovies()
  const { data: genres = [] } = useMovieGenres()
  const house = useCatalogHouse()

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

  const catalogDecades = useMemo(
    () => decadesPresentInCatalog(data?.movies ?? []),
    [data?.movies],
  )

  const visibleMovies = useMemo(() => {
    const filtered = filterCatalogMovies(
      data?.movies ?? [],
      view.query,
      view.genreIds,
      view.year,
      view.decade,
    )
    return sortCatalogMovies(filtered, view.sortBy)
  }, [data?.movies, view.query, view.genreIds, view.year, view.decade, view.sortBy])

  const paged = useMemo(
    () => paginate(visibleMovies, view.page, ARCHIVE_PAGE_SIZE),
    [visibleMovies, view.page],
  )

  const filtersActive = Boolean(
    view.query.trim() || view.genreIds.length > 0 || view.year || view.decade,
  )

  function patchView(partial: Partial<CatalogViewState>) {
    const resetsPage =
      partial.page == null &&
      ('query' in partial ||
        'genreIds' in partial ||
        'year' in partial ||
        'decade' in partial ||
        'sortBy' in partial)
    const next = { ...view, ...partial, ...(resetsPage ? { page: 1 } : {}) }
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

  useEffect(() => {
    if (!data) return
    if (view.page !== paged.page) patchView({ page: paged.page })
  }, [data, view.page, paged.page])

  useEffect(() => {
    if (!filtersOpen) return
    const media = window.matchMedia('(max-width: 767px)')
    if (!media.matches) return

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [filtersOpen])

  const skipPageScroll = useRef(true)
  useEffect(() => {
    if (skipPageScroll.current) {
      skipPageScroll.current = false
      return
    }
    window.scrollTo(0, 0)
  }, [view.page])

  return (
    <AppShell
      title="Archive"
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
          onYearChange={(year) => patchView({ year, decade: year ? '' : view.decade })}
          decades={catalogDecades}
          selectedDecade={view.decade}
          onDecadeChange={(decade) => patchView({ decade, year: decade ? '' : view.year })}
          filtersOpen={filtersOpen}
          onToggleFilters={() => setFiltersOpen((open) => !open)}
          onCloseFilters={() => setFiltersOpen(false)}
          sortBy={view.sortBy}
          onSortByChange={(sortBy: CatalogSort) => patchView({ sortBy })}
        />
      }
    >
      <Breadcrumbs
        items={[
          { label: 'Home', to: paths.home },
          { label: 'Archive' },
        ]}
      />

      {filtersOpen ? (
        <div
          className="fixed inset-x-0 bottom-0 z-40 overflow-y-auto overscroll-contain bg-ink px-5 pt-5 md:hidden"
          style={{ top: 'var(--app-header-h, 8.5rem)' }}
        >
          <CatalogMobileFilters
            genres={catalogGenres}
            selectedGenreIds={view.genreIds}
            onToggleGenre={toggleGenre}
            onClear={() => patchView({ genreIds: [], year: '', decade: '' })}
            onDone={() => setFiltersOpen(false)}
            years={catalogYears}
            selectedYear={view.year}
            onYearChange={(year) => patchView({ year, decade: year ? '' : view.decade })}
            decades={catalogDecades}
            selectedDecade={view.decade}
            onDecadeChange={(decade) => patchView({ decade, year: decade ? '' : view.year })}
            sortBy={view.sortBy}
            onSortByChange={(sortBy) => patchView({ sortBy })}
          />
        </div>
      ) : null}

      {!filtersActive && (data?.movies.length ?? 0) > 0 ? (
        <CatalogProgram
          movies={data?.movies ?? []}
          belovedIds={house.data?.belovedIds ?? []}
          genres={catalogGenres}
          years={catalogYears}
          onPickGenre={(id) => patchView({ genreIds: [id] })}
          onPickYear={(year) => patchView({ year, decade: '' })}
        />
      ) : null}

      {view.genreIds.length > 0 || view.decade ? (
        <ul className="mt-8 mb-8 flex flex-wrap gap-x-4 gap-y-2">
          {view.decade ? (
            <li>
              <button
                type="button"
                onClick={() => patchView({ decade: '' })}
                className="text-xs tracking-[0.16em] uppercase text-brand hover:text-ivory"
              >
                {catalogDecades.find((decade) => decade.id === view.decade)?.label ?? view.decade} ×
              </button>
            </li>
          ) : null}
          {catalogGenres
            .filter((genre) => view.genreIds.includes(genre.id))
            .map((genre) => (
              <li key={genre.id}>
                <button
                  type="button"
                  onClick={() => toggleGenre(genre.id)}
                  className="text-xs tracking-[0.16em] uppercase text-brand hover:text-ivory"
                >
                  {genre.name} ×
                </button>
              </li>
            ))}
        </ul>
      ) : null}

      {data && visibleMovies.length > 0 ? (
        <p className="mt-8 mb-10 font-serif text-lg text-ivory">
          {paged.from}–{paged.to}
          <span className="text-muted"> of {visibleMovies.length} titles</span>
          {filtersActive ? <span className="text-muted"> — filtered</span> : null}
        </p>
      ) : (
        <div className="mt-8" />
      )}

      <QueryState
        isPending={isPending && !data}
        isError={isError}
        error={error}
        isEmpty={visibleMovies.length === 0}
        pendingMessage="Loading archive..."
        emptyMessage={
          filtersActive
            ? 'No movies match this search, genre or year.'
            : 'No movies left in the archive.'
        }
        onRetry={() => {
          void refetch()
        }}
      >
        <MovieGrid movies={paged.items} />
        {paged.totalPages > 1 ? (
          <div className="mt-12 border-t border-ivory/10">
            <Pagination
              page={paged.page}
              totalPages={paged.totalPages}
              from={paged.from}
              to={paged.to}
              total={paged.total}
              onPage={(page) => patchView({ page })}
            />
          </div>
        ) : null}
      </QueryState>
    </AppShell>
  )
}
