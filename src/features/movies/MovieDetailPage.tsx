/**
 * =============================================================================
 * MovieDetailPage
 * =============================================================================
 *
 * Ruta: `/pelicula/:movieId`
 * Solo habla con useParams + useMovie. El JSX de ficha está en MovieDetailView.
 */

import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router'
import { AppShell } from '../../components/layout/AppShell.tsx'
import { QueryState } from '../../components/feedback/QueryState.tsx'
import { similarCatalogMovies } from '../../lib/catalog.ts'
import { paths, parseMovieIdParam } from '../../lib/paths.ts'
import { useBolivianMovies } from '../../query/movies/useBolivianMovies.ts'
import { useMovie } from '../../query/movies/useMovie.ts'
import { MovieDetailView } from './components/MovieDetailView.tsx'

export function MovieDetailPage() {
  const { movieId } = useParams()
  const id = parseMovieIdParam(movieId)
  const { data, isPending, isError, error, refetch } = useMovie(id ?? 0)
  const { data: catalog } = useBolivianMovies()
  const similar = useMemo(
    () => (data ? similarCatalogMovies(catalog?.movies ?? [], data) : []),
    [catalog?.movies, data],
  )

  useEffect(() => {
    const previous = document.title
    if (data?.title) document.title = `${data.title} — Cochacine`
    return () => {
      document.title = previous
    }
  }, [data?.title])

  if (id === null) {
    return (
      <AppShell title="Movie not found" wide>
        <p className="text-brand/80">That address is not a movie.</p>
        <Link
          to={paths.catalog()}
          className="mt-6 inline-block text-sm tracking-[0.18em] uppercase text-brand underline-offset-4 hover:underline"
        >
          Back to catalog
        </Link>
      </AppShell>
    )
  }

  return (
    <AppShell title={data?.title ?? 'Movie'} wide>
      <QueryState
        isPending={isPending && !data}
        isError={isError}
        error={error}
        pendingMessage="Opening title..."
        onRetry={() => {
          void refetch()
        }}
      >
        {data ? <MovieDetailView key={data.id} movie={data} similar={similar} /> : null}
      </QueryState>
    </AppShell>
  )
}
