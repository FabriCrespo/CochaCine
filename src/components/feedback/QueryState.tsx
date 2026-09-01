/**
 * =============================================================================
 * QueryState — UI de loading / error / vacío
 * =============================================================================
 *
 * React Query te da flags. Este componente decide qué pintar
 * para no copiar el mismo if/else en cada página.
 *
 * Cómo reutilizarlo:
 *   const query = useMovie(id)
 *   <QueryState isPending={query.isPending} isError={query.isError} error={query.error} onRetry={query.refetch}>
 *     <MovieDetail movie={query.data} />
 *   </QueryState>
 *
 * error entra como AppError | null porque así tipamos los hooks.
 */

import type { ReactNode } from 'react'
import type { AppError } from '../../api/http/errors.ts'

type QueryStateProps = {
  isPending: boolean
  isError: boolean
  error: AppError | null
  isEmpty?: boolean
  emptyMessage?: string
  pendingMessage?: string
  onRetry?: () => void
  children: ReactNode
}

export function QueryState({
  isPending,
  isError,
  error,
  isEmpty = false,
  emptyMessage = 'No results.',
  pendingMessage = 'Loading movies...',
  onRetry,
  children,
}: QueryStateProps) {
  if (isPending) {
    return <p className="text-brand/70">{pendingMessage}</p>
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
        <p>{error?.message ?? 'Something went wrong.'}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-md bg-red-500/20 px-3 py-1.5 text-sm font-medium text-red-100 hover:bg-red-500/30"
          >
            Retry
          </button>
        ) : null}
      </div>
    )
  }

  if (isEmpty) {
    return <p className="text-brand/70">{emptyMessage}</p>
  }

  return children
}
