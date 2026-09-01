import { useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { clearAdminSession, hasAdminSession } from '../../api/supabase/adminClient.ts'
import type { Movie } from '../../domain/movie.ts'
import { filterCatalogMovies } from '../../lib/catalog.ts'
import { paths, parseMovieIdParam } from '../../lib/paths.ts'
import { useBolivianMovies } from '../../query/movies/useBolivianMovies.ts'
import { useMovieSource } from '../../query/movies/useMovieSource.ts'
import { useMovieOverride, useOverrideList } from '../../query/overrides/useOverrides.ts'
import { AdminEditor } from './AdminEditor.tsx'
import { AdminUnlock } from './AdminUnlock.tsx'

type ListFilter = 'all' | 'missing-overview' | 'missing-poster' | 'edited'

export function AdminPage() {
  const { movieId } = useParams()
  const navigate = useNavigate()
  const selectedId = parseMovieIdParam(movieId)
  const [unlocked, setUnlocked] = useState(() => hasAdminSession())
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<ListFilter>('missing-overview')

  const catalog = useBolivianMovies()
  const overrides = useOverrideList()
  const selectedMovie = catalog.data?.movies.find((movie) => movie.id === selectedId) ?? null
  const source = useMovieSource(selectedId ?? 0)
  const override = useMovieOverride(selectedId ?? 0)

  const editedIds = useMemo(() => {
    return new Set((overrides.data ?? []).map((row) => row.tmdb_id))
  }, [overrides.data])

  const visibleMovies = useMemo(() => {
    const searched = filterCatalogMovies(catalog.data?.movies ?? [], query, [], '')
    return searched.filter((movie) => matchesFilter(movie, filter, editedIds))
  }, [catalog.data?.movies, query, filter, editedIds])

  if (!unlocked) {
    return (
      <AdminFrame>
        <AdminUnlock onUnlocked={() => setUnlocked(true)} />
      </AdminFrame>
    )
  }

  return (
    <AdminFrame
      onLock={() => {
        clearAdminSession()
        setUnlocked(false)
      }}
    >
      <div className="grid min-h-[calc(100vh-5.5rem)] gap-0 lg:grid-cols-[minmax(260px,340px)_1fr]">
        <aside className="flex min-h-0 flex-col border-b border-brand/25 lg:border-r lg:border-b-0">
          <div className="space-y-3 p-4">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar título..."
              className="w-full border border-brand/40 bg-ink px-3 py-2 text-sm text-brand outline-none placeholder:text-brand/40 focus:border-brand"
            />
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ['missing-overview', 'Sin sinopsis'],
                  ['missing-poster', 'Sin póster'],
                  ['edited', 'Editadas'],
                  ['all', 'Todas'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={
                    filter === value
                      ? 'border border-brand bg-brand px-2 py-1 text-[11px] tracking-[0.12em] uppercase text-ink'
                      : 'border border-brand/40 px-2 py-1 text-[11px] tracking-[0.12em] uppercase text-brand/70 hover:border-brand'
                  }
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-brand/50">
              {visibleMovies.length} títulos
              {overrides.isError ? ' · no pude leer overrides (¿corriste el SQL?)' : ''}
            </p>
          </div>
          <ul className="min-h-0 flex-1 overflow-auto">
            {catalog.isPending ? (
              <li className="px-4 py-3 text-sm text-brand/60">Cargando catálogo...</li>
            ) : null}
            {visibleMovies.map((movie) => {
              const active = movie.id === selectedId
              const edited = editedIds.has(movie.id)
              return (
                <li key={movie.id}>
                  <button
                    type="button"
                    onClick={() => navigate(paths.adminMovie(movie.id))}
                    className={
                      active
                        ? 'flex w-full items-center gap-3 bg-brand/15 px-4 py-2 text-left'
                        : 'flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-brand/10'
                    }
                  >
                    {movie.posterUrl ? (
                      <img src={movie.posterUrl} alt="" className="h-14 w-10 shrink-0 object-cover" />
                    ) : (
                      <div className="flex h-14 w-10 shrink-0 items-center justify-center bg-ink-soft text-[9px] text-brand/40">
                        —
                      </div>
                    )}
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-brand">{movie.title}</span>
                      <span className="mt-0.5 block text-[11px] text-brand/50">
                        {movie.releaseYear ?? 's/año'}
                        {edited ? ' · editada' : ''}
                        {!movie.overview ? ' · sin sinopsis' : ''}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>

        <section className="min-h-0 overflow-auto p-4 lg:p-6">
          {selectedMovie ? (
            <AdminEditor
              key={selectedMovie.id}
              movie={selectedMovie}
              source={source.data}
              override={override.data}
            />
          ) : (
            <p className="pt-16 text-center text-sm text-brand/60">
              Elegí una película a la izquierda. El filtro arranca en las que no tienen sinopsis.
            </p>
          )}
        </section>
      </div>
    </AdminFrame>
  )
}

function matchesFilter(movie: Movie, filter: ListFilter, editedIds: Set<number>): boolean {
  if (filter === 'missing-overview') return !movie.overview.trim()
  if (filter === 'missing-poster') return !movie.posterUrl
  if (filter === 'edited') return editedIds.has(movie.id)
  return true
}

function AdminFrame({
  children,
  onLock,
}: {
  children: ReactNode
  onLock?: () => void
}) {
  return (
    <div className="min-h-screen bg-ink text-brand">
      <header className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to={paths.catalog()} className="block w-28 shrink-0">
            <img src="/logo.png?v=2" alt="Cochacine" className="h-auto w-full" />
          </Link>
          <p className="text-xs tracking-[0.22em] uppercase text-brand/70">Editor</p>
        </div>
        <div className="flex items-center gap-3 text-xs tracking-[0.16em] uppercase">
          <Link to={paths.catalog()} className="text-brand/70 hover:text-brand">
            Cartelera
          </Link>
          {onLock ? (
            <button type="button" onClick={onLock} className="text-brand/70 hover:text-brand">
              Salir
            </button>
          ) : null}
        </div>
      </header>
      {children}
    </div>
  )
}
