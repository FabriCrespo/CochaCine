/**
 * Ficha estilo streaming: póster + ficha, reparto, sinopsis y similares.
 */

import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import type { Movie, MovieCastMember, MovieDetail, MovieHighlight } from '../../../domain/movie.ts'
import {
  formatReleaseDateLong,
  formatRuntimeCompact,
} from '../../../lib/dates.ts'
import { paths } from '../../../lib/paths.ts'
import { isOnWatchlist, toggleWatchlist } from '../../../lib/watchlist.ts'
import { usePrefetchMovie } from '../../../query/movies/useMovie.ts'
import { HorizontalCarousel } from './HorizontalCarousel.tsx'
import { TrailerModal } from './TrailerModal.tsx'

type MovieDetailViewProps = {
  movie: MovieDetail
  similar: Movie[]
}

export function MovieDetailView({ movie, similar }: MovieDetailViewProps) {
  const [trailerOpen, setTrailerOpen] = useState(false)
  const [saved, setSaved] = useState(() => isOnWatchlist(movie.id))
  const prefetch = usePrefetchMovie()
  const runtime = formatRuntimeCompact(movie.runtimeMinutes)
  const overview = movie.overview.trim()
  const longPlot = (movie.plot ?? '').trim()
  const teaser = teaserOverview(overview || longPlot)
  const detailed = longPlot || overview
  const showDetailed = Boolean(longPlot) || detailed.length > teaser.length
  const writers = movie.writers ?? []
  const companies = movie.productionCompanies ?? []
  const highlights = movie.highlights ?? []
  const facts = [
    { label: 'Director', value: movie.director?.name },
    { label: 'Screenplay', value: joinList(writers) },
    { label: 'Production', value: joinList(companies) },
    { label: 'Country', value: joinList(movie.countries) },
    { label: 'Language', value: joinList(movie.languages) },
    { label: 'Released', value: formatReleaseDateLong(movie.releaseDate) },
  ]

  return (
    <article className="text-white">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,280px)_1fr] xl:grid-cols-[minmax(0,320px)_1fr] xl:gap-12">
        <div className="mx-auto w-full max-w-72 overflow-hidden rounded-xl bg-ink-soft lg:mx-0">
          {movie.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt=""
              className="aspect-2/3 w-full object-cover"
            />
          ) : (
            <div className="flex aspect-2/3 items-center justify-center text-sm text-white/40">
              No poster
            </div>
          )}
        </div>

        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase text-brand">
            <BoliviaFlag />
            Bolivian cinema
          </p>

          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {movie.title}
          </h2>

          <MetaRow movie={movie} runtime={runtime} />

          {teaser ? (
            <p className="mt-6 max-w-2xl text-[15px] leading-7 text-white/70">{teaser}</p>
          ) : (
            <p className="mt-6 max-w-2xl text-[15px] leading-7 text-white/45">
              No English plot is available for this title.
            </p>
          )}

          <div className="mt-7 flex flex-wrap gap-3">
            {movie.trailerYoutubeKey ? (
              <button
                type="button"
                onClick={() => setTrailerOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-ink hover:bg-brand/90"
              >
                <PlayIcon />
                Watch trailer
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setSaved(toggleWatchlist(movie.id))}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-2.5 text-sm font-medium text-white hover:border-white/40 hover:bg-white/5"
            >
              <BookmarkIcon filled={saved} />
              {saved ? 'On my list' : 'Want to watch'}
            </button>
          </div>

          <dl className="mt-8 grid gap-x-16 gap-y-2.5 sm:grid-cols-2">
            {facts.map((fact) => (
              <div key={fact.label} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 text-sm">
                <dt className="text-white/40">{fact.label}</dt>
                <dd className="text-white">{fact.value || '—'}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {movie.cast.length > 0 ? (
        <div className="mt-16">
          <HorizontalCarousel title="Main cast">
            {movie.cast.map((person) => (
              <CastCard key={person.id} person={person} />
            ))}
          </HorizontalCarousel>
        </div>
      ) : null}

      {showDetailed || highlights.length > 0 ? (
        <div className="mt-16 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)]">
          {showDetailed ? (
            <section>
              <h3 className="text-xl font-semibold text-white">Plot</h3>
              <div className="mt-4 max-w-2xl space-y-4 text-[15px] leading-7 text-white/70">
                {splitParagraphs(detailed).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ) : (
            <div />
          )}
          {highlights.length > 0 ? <HighlightsCard highlights={highlights} /> : null}
        </div>
      ) : null}

      {similar.length > 0 ? (
        <div className="mt-16">
          <HorizontalCarousel title="Similar titles">
            {similar.map((item) => (
              <Link
                key={item.id}
                to={paths.movie(item.id)}
                className="w-40 shrink-0 sm:w-44"
                onMouseEnter={() => prefetch(item.id)}
              >
                <div className="overflow-hidden rounded-xl bg-ink-soft">
                  {item.posterUrl ? (
                    <img
                      src={item.posterUrl}
                      alt=""
                      className="aspect-2/3 w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-2/3 items-center justify-center text-xs text-white/35">
                      No poster
                    </div>
                  )}
                </div>
                <p className="mt-2 truncate text-sm text-white">{item.title}</p>
                <p className="text-xs text-white/45">{item.releaseYear ?? ''}</p>
              </Link>
            ))}
          </HorizontalCarousel>
        </div>
      ) : null}

      {trailerOpen && movie.trailerYoutubeKey ? (
        <TrailerModal
          youtubeKey={movie.trailerYoutubeKey}
          title={movie.title}
          onClose={() => setTrailerOpen(false)}
        />
      ) : null}
    </article>
  )
}

function MetaRow({
  movie,
  runtime,
}: {
  movie: MovieDetail
  runtime: string | null
}) {
  const parts: Array<{ key: string; node: ReactNode }> = []

  if (movie.rating > 0) {
    parts.push({
      key: 'rating',
      node: (
        <span className="inline-flex items-center gap-1.5 text-brand">
          <StarIcon />
          {movie.rating.toFixed(1)}
        </span>
      ),
    })
  }
  if (movie.releaseYear) {
    parts.push({ key: 'year', node: movie.releaseYear })
  }
  if (runtime) {
    parts.push({ key: 'runtime', node: runtime })
  }
  if (movie.genres.length > 0) {
    parts.push({ key: 'genres', node: movie.genres.join(', ') })
  }
  if (movie.certification) {
    parts.push({
      key: 'cert',
      node: (
        <span className="rounded border border-white/35 px-1.5 py-0.5 text-[11px] tracking-wide text-white/80">
          {movie.certification}
        </span>
      ),
    })
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/70">
      {parts.map((part, index) => (
        <span key={part.key} className="inline-flex items-center gap-3">
          {index > 0 ? <span className="h-3.5 w-px bg-white/20" aria-hidden /> : null}
          {part.node}
        </span>
      ))}
    </div>
  )
}

function CastCard({ person }: { person: MovieCastMember }) {
  const [photoFailed, setPhotoFailed] = useState(false)
  const showPhoto = Boolean(person.photoUrl) && !photoFailed

  return (
    <div className="w-32 shrink-0 text-center">
      <div className="mx-auto h-28 w-28 overflow-hidden rounded-full bg-ink ring-1 ring-brand/35">
        {showPhoto ? (
          <img
            src={person.photoUrl ?? undefined}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setPhotoFailed(true)}
          />
        ) : (
          <PersonPlaceholder />
        )}
      </div>
      <p className="mt-3 truncate text-sm text-white">{person.name}</p>
      <p className="truncate text-xs text-brand">{person.character || '—'}</p>
    </div>
  )
}

function HighlightsCard({ highlights }: { highlights: MovieHighlight[] }) {
  return (
    <aside className="rounded-2xl bg-[#161616] px-5 py-5">
      <ul className="space-y-4">
        {highlights.map((item, index) => (
          <li key={`${item.kind}-${index}`} className="flex gap-3 text-sm leading-6 text-white/80">
            <span className="mt-0.5 shrink-0 text-brand">
              <HighlightIcon kind={item.kind} index={index} />
            </span>
            {item.text}
          </li>
        ))}
      </ul>
    </aside>
  )
}

function teaserOverview(overview: string): string {
  if (!overview) return ''
  const sentences = overview.split(/(?<=[.!?])\s+/)
  if (sentences.length <= 2 && overview.length <= 280) return overview
  return sentences.slice(0, 2).join(' ')
}

function splitParagraphs(overview: string): string[] {
  const chunks = overview.split(/\n{2,}/).map((chunk) => chunk.trim()).filter(Boolean)
  if (chunks.length > 1) return chunks

  const sentences = overview.split(/(?<=[.!?])\s+/).filter(Boolean)
  if (sentences.length <= 3) return [overview]

  const mid = Math.ceil(sentences.length / 2)
  return [sentences.slice(0, mid).join(' '), sentences.slice(mid).join(' ')]
}

function joinList(values: string[]): string | null {
  if (values.length === 0) return null
  return values.join(', ')
}

function PersonPlaceholder() {
  return (
    <div className="flex h-full items-end justify-center bg-ink" aria-hidden>
      <svg viewBox="0 0 64 64" className="h-[78%] w-[78%] text-brand">
        <circle cx="32" cy="22" r="12" fill="currentColor" />
        <path d="M10 62c1.5-14 11-22 22-22s20.5 8 22 22" fill="currentColor" />
      </svg>
    </div>
  )
}

function BoliviaFlag() {
  return (
    <svg viewBox="0 0 21 15" className="h-3.5 w-5 rounded-[1px]" aria-hidden>
      <rect width="21" height="5" fill="#D52B1E" />
      <rect y="5" width="21" height="5" fill="#F9E300" />
      <rect y="10" width="21" height="5" fill="#007934" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="m12 3.2 2.47 5.01 5.53.8-4 3.9.94 5.49L12 15.9l-4.94 2.5.94-5.49-4-3.9 5.53-.8z" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M8 5.5v13l11-6.5z" />
    </svg>
  )
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill={filled ? 'currentColor' : 'none'} aria-hidden>
      <path
        d="M7 4.5h10a1 1 0 0 1 1 1v14l-6-3.2-6 3.2v-14a1 1 0 0 1 1-1z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  )
}

function HighlightIcon({
  kind,
  index,
}: {
  kind: MovieHighlight['kind']
  index: number
}) {
  if (kind === 'bolivia') return <ShieldIcon />
  if (kind === 'true-story') return <BriefcaseIcon />
  const cycle = [TrophyIcon, StarOutlineIcon, ShieldIcon, BriefcaseIcon]
  const Icon = cycle[index % cycle.length]
  return <Icon />
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M8 4h8v4a4 4 0 0 1-8 0z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M8 6H5.5A2.5 2.5 0 0 0 8 8.5M16 6h2.5A2.5 2.5 0 0 1 16 8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 12v3M9 20h6M10 17h4v3h-4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function StarOutlineIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="m12 3.5 2.3 4.7 5.2.8-3.8 3.6.9 5.2L12 15.7 7.4 17.8l.9-5.2-3.8-3.6 5.2-.8z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M12 3.5 5.5 6.2v5.3c0 4 2.7 7.5 6.5 8.5 3.8-1 6.5-4.5 6.5-8.5V6.2z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <rect x="4" y="8" width="16" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 8V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V8" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}
