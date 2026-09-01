/**
 * =============================================================================
 * MovieDetailPage
 * =============================================================================
 *
 * Ruta: `/pelicula/:movieId`
 * Solo habla con useParams + useMovie. El JSX de ficha está en MovieDetailView.
 */

import { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { AppShell } from '../../components/layout/AppShell.tsx'
import { QueryState } from '../../components/feedback/QueryState.tsx'
import { paths, parseMovieIdParam } from '../../lib/paths.ts'
import { useMovie } from '../../query/movies/useMovie.ts'
import { MovieDetailView } from './components/MovieDetailView.tsx'

export function MovieDetailPage() {
  const { movieId } = useParams()
  const id = parseMovieIdParam(movieId)
  const { data, isPending, isError, error, refetch } = useMovie(id ?? 0)

  useEffect(() => {
    const previous = document.title
    if (data?.title) document.title = `${data.title} — Cochacine`
    return () => {
      document.title = previous
    }
  }, [data?.title])

  if (id === null) {
    return (
      <AppShell title="Película no encontrada">
        <p className="text-brand/80">Esa dirección no corresponde a una película.</p>
        <Link
          to={paths.catalog()}
          className="mt-6 inline-block text-sm tracking-[0.18em] uppercase text-brand underline-offset-4 hover:underline"
        >
          Volver a la cartelera
        </Link>
      </AppShell>
    )
  }

  return (
    <AppShell title={data?.title ?? 'Ficha'}>
      <QueryState
        isPending={isPending && !data}
        isError={isError}
        error={error}
        pendingMessage="Abriendo ficha..."
        onRetry={() => {
          void refetch()
        }}
      >
        {data ? <MovieDetailView movie={data} /> : null}
      </QueryState>
    </AppShell>
  )
}
