import { MARCOS_LOAYZA_PHOTO } from '../../../config/constants.ts'
import { QueryState } from '../../../components/feedback/QueryState.tsx'
import { useMarcosLoayzaMovies } from '../../../query/movies/useMarcosLoayzaMovies.ts'
import { MovieGrid } from './MovieGrid.tsx'

export function LoayzaSpecial() {
  const { data: movies = [], isPending, isError, error, refetch } = useMarcosLoayzaMovies()

  return (
    <section className="mb-12 border border-brand/35 bg-ink-soft p-4 sm:p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <img
          src={MARCOS_LOAYZA_PHOTO}
          alt="Marcos Loayza"
          className="aspect-3/4 w-full max-w-48 object-cover object-top grayscale sm:w-44"
        />
        <div className="min-w-0 pb-1">
          <p className="text-xs tracking-[0.28em] uppercase text-brand/60">Director</p>
          <h2 className="mt-2 font-serif text-3xl tracking-wide text-brand sm:text-4xl">
            Marcos Loayza Special
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-brand/75">
            Paceño filmmaker. A Matter of Faith and the rest of his directed features,
            as listed on TMDB.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <QueryState
          isPending={isPending && movies.length === 0}
          isError={isError}
          error={error}
          isEmpty={movies.length === 0}
          pendingMessage="Loading Loayza films..."
          emptyMessage="No directed films found on TMDB."
          onRetry={() => {
            void refetch()
          }}
        >
          <MovieGrid movies={movies} />
        </QueryState>
      </div>
    </section>
  )
}
