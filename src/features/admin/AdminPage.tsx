import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs.tsx'
import { Pagination } from '../../components/layout/Pagination.tsx'
import type { Movie } from '../../domain/movie.ts'
import { filterCatalogMovies } from '../../lib/catalog.ts'
import { paginate } from '../../lib/pagination.ts'
import { paths, parseMovieIdParam } from '../../lib/paths.ts'
import { useBolivianMovies } from '../../query/movies/useBolivianMovies.ts'
import { useMovieSource } from '../../query/movies/useMovieSource.ts'
import { useMoveCatalogBeloved, useCatalogHouse } from '../../query/house/useCatalogHouse.ts'
import { useMovieOverride, useOverrideList } from '../../query/overrides/useOverrides.ts'
import { AdminAddTitle } from './AdminAddTitle.tsx'
import { AdminEditor } from './AdminEditor.tsx'
import { AdminUnlock } from './AdminUnlock.tsx'
import { useAdminAuth } from './useAdminAuth.ts'

type ListFilter = 'missing-overview' | 'missing-poster' | 'edited' | 'beloved' | 'hidden' | 'all'

const FILTERS: { id: ListFilter; label: string }[] = [
  { id: 'missing-overview', label: 'No plot' },
  { id: 'missing-poster', label: 'No poster' },
  { id: 'edited', label: 'Edited' },
  { id: 'beloved', label: 'Beloved' },
  { id: 'hidden', label: 'Hidden' },
  { id: 'all', label: 'All' },
]

export function AdminPage() {
  const { movieId } = useParams()
  const navigate = useNavigate()
  const selectedId = parseMovieIdParam(movieId)
  const auth = useAdminAuth()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<ListFilter>('missing-overview')
  const [page, setPage] = useState(1)
  const [pinned, setPinned] = useState<Movie | null>(null)

  const catalog = useBolivianMovies({ includeHidden: true })
  const overrides = useOverrideList()
  const house = useCatalogHouse()
  const moveBeloved = useMoveCatalogBeloved()
  const hiddenIds = useMemo(
    () => new Set(house.data?.hiddenIds ?? []),
    [house.data?.hiddenIds],
  )
  const belovedIds = house.data?.belovedIds ?? []
  const belovedSet = useMemo(() => new Set(belovedIds), [belovedIds])

  const catalogMovies = useMemo(() => {
    const movies = catalog.data?.movies ?? []
    if (pinned && !movies.some((movie) => movie.id === pinned.id)) {
      return [pinned, ...movies]
    }
    return movies
  }, [catalog.data?.movies, pinned])

  const selectedMovie =
    catalogMovies.find((movie) => movie.id === selectedId) ??
    (pinned?.id === selectedId ? pinned : null)
  const source = useMovieSource(selectedId ?? 0)
  const override = useMovieOverride(selectedId ?? 0)

  const editedIds = useMemo(() => {
    return new Set((overrides.data ?? []).map((row) => row.tmdb_id))
  }, [overrides.data])

  const counts = useMemo(() => {
    const searched = filterCatalogMovies(catalogMovies, query, [], '')
    const publicMovies = searched.filter((movie) => !hiddenIds.has(movie.id))
    return {
      'missing-overview': publicMovies.filter((movie) => !movie.overview.trim()).length,
      'missing-poster': publicMovies.filter((movie) => !movie.posterUrl).length,
      edited: publicMovies.filter((movie) => editedIds.has(movie.id)).length,
      beloved: searched.filter((movie) => belovedSet.has(movie.id)).length,
      hidden: searched.filter((movie) => hiddenIds.has(movie.id)).length,
      all: publicMovies.length,
    } satisfies Record<ListFilter, number>
  }, [catalogMovies, query, editedIds, hiddenIds, belovedSet])

  const visibleMovies = useMemo(() => {
    const searched = filterCatalogMovies(catalogMovies, query, [], '')
    if (filter === 'beloved') {
      const byId = new Map(searched.map((movie) => [movie.id, movie]))
      return belovedIds
        .map((id) => byId.get(id))
        .filter((movie): movie is Movie => movie != null)
    }
    return searched.filter((movie) =>
      matchesFilter(movie, filter, editedIds, hiddenIds, belovedSet),
    )
  }, [catalogMovies, query, filter, editedIds, hiddenIds, belovedSet, belovedIds])

  const paged = useMemo(() => paginate(visibleMovies, page), [visibleMovies, page])

  useEffect(() => {
    setPage(1)
  }, [query, filter])

  if (!auth.ready) {
    return (
      <AdminFrame>
        <p className="pt-24 text-center font-serif text-ivory/50">Checking session...</p>
      </AdminFrame>
    )
  }

  if (!auth.configured) {
    return (
      <AdminFrame>
        <p className="mx-auto max-w-md pt-24 text-center font-serif leading-7 text-ivory/60">
          Missing Supabase keys in <span className="text-ivory">.env</span>. Add{' '}
          <span className="text-ivory">VITE_SUPABASE_URL</span> and{' '}
          <span className="text-ivory">VITE_SUPABASE_PUBLISHABLE_KEY</span>, then restart the
          dev server.
        </p>
      </AdminFrame>
    )
  }

  if (!auth.user) {
    return (
      <AdminFrame>
        <AdminUnlock onSignIn={auth.signIn} />
      </AdminFrame>
    )
  }

  if (!auth.isEditor) {
    return (
      <AdminFrame onLock={() => void auth.signOut()}>
        <p className="mx-auto max-w-md pt-24 text-center font-serif leading-7 text-ivory/60">
          {auth.error ?? 'This account cannot edit the catalog.'}
        </p>
      </AdminFrame>
    )
  }

  return (
    <AdminFrame
      email={auth.user.email}
      onLock={() => {
        void auth.signOut()
      }}
    >
      <div className="grid min-h-[calc(100vh-4.5rem)] lg:grid-cols-[20rem_1fr] xl:grid-cols-[22rem_1fr]">
        <aside
          className={`flex min-h-0 flex-col border-ivory/8 bg-ink ${
            selectedMovie ? 'hidden lg:flex' : 'flex'
          }`}
        >
            <div className="space-y-4 px-5 pt-4 pb-3">
              <Breadcrumbs
                items={[
                  { label: 'Home', to: paths.home },
                  { label: 'Editor' },
                ]}
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the stacks..."
                className="w-full border-0 border-b border-ivory/20 bg-transparent py-2 font-serif text-ivory outline-none placeholder:text-ivory/30 focus:border-brand"
              />
              <div className="flex flex-wrap gap-1.5">
                {FILTERS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFilter(item.id)}
                    className={
                      filter === item.id
                        ? 'bg-brand px-2.5 py-1 text-[10px] tracking-[0.16em] uppercase text-ink'
                        : 'px-2.5 py-1 text-[10px] tracking-[0.16em] uppercase text-muted hover:text-ivory'
                    }
                  >
                    {item.label}
                    <span className="ml-1.5 opacity-60">{counts[item.id]}</span>
                  </button>
                ))}
              </div>
              {overrides.isError ? (
                <p className="font-serif text-xs text-red-300/90">
                  Could not load overrides. Did you run the SQL?
                </p>
              ) : null}
              {house.isError ? (
                <p className="font-serif text-xs text-red-300/90">{house.error.message}</p>
              ) : null}
            </div>

          <ul className="min-h-0 flex-1 overflow-auto px-2 pb-2">
            {catalog.isPending ? (
              <li className="px-3 py-4 font-serif text-sm text-ivory/40">Loading catalog...</li>
            ) : null}
            {!catalog.isPending && visibleMovies.length === 0 ? (
              <li className="px-3 py-4 font-serif text-sm text-ivory/40">Nothing in this tray.</li>
            ) : null}
            {paged.items.map((movie) => {
              const active = movie.id === selectedId
              const edited = editedIds.has(movie.id)
              const needsPlot = !movie.overview.trim()
              const hidden = hiddenIds.has(movie.id)
              const beloved = belovedSet.has(movie.id)
              return (
                <li key={movie.id}>
                  <div
                    className={`flex w-full items-center gap-3 px-3 py-2.5 ${
                      active ? 'bg-ivory/8' : 'hover:bg-ivory/5'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => navigate(paths.adminMovie(movie.id))}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      {movie.posterUrl ? (
                        <img src={movie.posterUrl} alt="" className="h-14 w-10 shrink-0 object-cover" />
                      ) : (
                        <div className="flex h-14 w-10 shrink-0 items-center justify-center bg-ink-soft text-[9px] text-muted">
                          —
                        </div>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-serif text-[15px] text-ivory">{movie.title}</span>
                        <span className="mt-0.5 block text-[11px] text-muted">
                          {movie.releaseYear ?? '—'}
                          {edited ? ' · edited' : ''}
                          {needsPlot ? ' · no plot' : ''}
                          {beloved ? ' · beloved' : ''}
                          {hidden ? ' · hidden' : ''}
                        </span>
                      </span>
                    </button>
                    {filter === 'beloved' ? (
                      <span className="flex shrink-0 flex-col">
                        <button
                          type="button"
                          disabled={belovedIds.indexOf(movie.id) <= 0 || moveBeloved.isPending}
                          onClick={() =>
                            void moveBeloved.mutateAsync({ tmdbId: movie.id, direction: -1 })
                          }
                          className="px-1 text-[10px] text-muted hover:text-ivory disabled:opacity-20"
                          aria-label="Move up"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          disabled={
                            belovedIds.indexOf(movie.id) >= belovedIds.length - 1 ||
                            moveBeloved.isPending
                          }
                          onClick={() =>
                            void moveBeloved.mutateAsync({ tmdbId: movie.id, direction: 1 })
                          }
                          className="px-1 text-[10px] text-muted hover:text-ivory disabled:opacity-20"
                          aria-label="Move down"
                        >
                          ▼
                        </button>
                      </span>
                    ) : (
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          hidden
                            ? 'bg-red-400/80'
                            : beloved
                              ? 'bg-brand'
                              : needsPlot
                                ? 'bg-brand'
                                : edited
                                  ? 'bg-ivory/40'
                                  : 'bg-transparent'
                        }`}
                      />
                    )}
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="border-t border-ivory/8 px-5 pt-1 pb-4">
            <Pagination
              page={paged.page}
              totalPages={paged.totalPages}
              from={paged.from}
              to={paged.to}
              total={paged.total}
              onPage={setPage}
            />
            <AdminAddTitle
              onAdded={(movie) => {
                setPinned(movie)
                setFilter('all')
                setPage(1)
                navigate(paths.adminMovie(movie.id))
              }}
            />
          </div>
        </aside>

        <section className="min-h-0 overflow-auto bg-paper text-ink">
          {selectedMovie ? (
            <AdminEditor
              key={selectedMovie.id}
              movie={selectedMovie}
              source={source.data}
              override={override.data}
            />
          ) : (
            <div className="flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-center px-8 text-center">
              <p className="text-[11px] tracking-[0.28em] uppercase text-ink/40">The stacks</p>
              <p className="mt-4 font-display text-4xl italic text-ink">Choose a title</p>
              <p className="mt-4 max-w-sm font-serif leading-7 text-ink/55">
                The list opens on films with no English plot. Hide a title to take it off the
                archive, or pin up to ten for Most beloved on the home.
              </p>
            </div>
          )}
        </section>
      </div>
    </AdminFrame>
  )
}

function matchesFilter(
  movie: Movie,
  filter: ListFilter,
  editedIds: Set<number>,
  hiddenIds: Set<number>,
  belovedIds: Set<number>,
): boolean {
  if (filter === 'hidden') return hiddenIds.has(movie.id)
  if (filter === 'beloved') return belovedIds.has(movie.id)
  if (hiddenIds.has(movie.id)) return false
  if (filter === 'missing-overview') return !movie.overview.trim()
  if (filter === 'missing-poster') return !movie.posterUrl
  if (filter === 'edited') return editedIds.has(movie.id)
  return true
}

function AdminFrame({
  children,
  onLock,
  email,
}: {
  children: ReactNode
  onLock?: () => void
  email?: string
}) {
  return (
    <div className="min-h-screen bg-ink font-sans text-ivory">
      <header className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b border-ivory/8 bg-ink/90 px-5 py-3.5 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Link to={paths.home} className="shrink-0">
            <img src="/logo.png?v=2" alt="Cochacine" className="h-10 w-auto sm:h-11" />
          </Link>
          <p className="text-[10px] tracking-[0.22em] uppercase text-muted">Editor</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] tracking-[0.18em] uppercase">
          {email ? (
            <span className="hidden max-w-44 truncate normal-case tracking-normal text-muted sm:inline">
              {email}
            </span>
          ) : null}
          <Link to={paths.catalog()} className="text-muted hover:text-ivory">
            Archive
          </Link>
          {onLock ? (
            <button type="button" onClick={onLock} className="text-muted hover:text-ivory">
              Sign out
            </button>
          ) : null}
        </div>
      </header>
      {children}
    </div>
  )
}
