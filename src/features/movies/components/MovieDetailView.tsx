/**
 * Ficha editorial: póster, créditos en dossier de papel, notas como fichas.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { Breadcrumbs } from '../../../components/layout/Breadcrumbs.tsx'
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

const focusRing =
  'outline-none focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-brand'

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
  const plotParagraphs = showDetailed ? splitParagraphs(detailed) : []
  const highlights = movie.highlights ?? []
  const originalTitle =
    movie.originalTitle.trim() && movie.originalTitle.trim() !== movie.title.trim()
      ? movie.originalTitle.trim()
      : null
  const credits = [
    { label: 'Director', value: movie.director?.name ?? null },
    { label: 'Screenplay', value: joinList(movie.writers ?? []) },
    { label: 'Production', value: joinList(movie.productionCompanies ?? []) },
    { label: 'Country', value: joinList(movie.countries) },
    { label: 'Language', value: joinList(movie.languages) },
    { label: 'Released', value: formatReleaseDateLong(movie.releaseDate) },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value))
  const hasDossier = credits.length > 0 || highlights.length > 0 || plotParagraphs.length > 0

  return (
    <article className="text-ivory">
      <div className="mb-10">
        <Breadcrumbs
          items={[
            { label: 'Home', to: paths.home },
            { label: 'Archive', to: paths.catalog() },
            { label: movie.title },
          ]}
        />
      </div>

      <div className="fiche-hero grid items-start gap-12 lg:grid-cols-[minmax(0,300px)_1fr] lg:gap-16 xl:grid-cols-[minmax(0,340px)_1fr] xl:gap-20">
        <PosterPlate
          posterUrl={movie.posterUrl}
          title={movie.title}
          hasTrailer={Boolean(movie.trailerYoutubeKey)}
          onPlay={() => setTrailerOpen(true)}
        />

        <div className="min-w-0 lg:pt-2">
          <p className="flex items-center gap-2 text-[11px] tracking-[0.28em] uppercase text-brand">
            <BoliviaFlag />
            Bolivian cinema
          </p>

          <h2 className="mt-5 font-display text-5xl italic leading-[0.92] text-ivory sm:text-6xl lg:text-7xl">
            {movie.title}
          </h2>
          <span className="fiche-mark mt-6 block h-px w-16 origin-left bg-brand" />

          {originalTitle ? (
            <p className="mt-5 font-serif text-lg italic text-ivory/45">{originalTitle}</p>
          ) : null}

          {movie.tagline ? (
            <p className="mt-6 max-w-xl font-display text-2xl italic leading-snug text-ivory/75">
              {movie.tagline}
            </p>
          ) : null}

          <MetaRow movie={movie} runtime={runtime} />

          {teaser ? (
            <p className="mt-10 max-w-2xl font-serif text-lg leading-8 text-ivory/70">{teaser}</p>
          ) : (
            <p className="mt-10 max-w-2xl font-serif text-lg leading-8 text-muted">
              No English plot is available for this title.
            </p>
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            {movie.trailerYoutubeKey ? (
              <button
                type="button"
                onClick={() => setTrailerOpen(true)}
                className={`inline-flex items-center gap-2 bg-brand px-5 py-2.5 text-xs tracking-[0.16em] uppercase text-ink transition-[letter-spacing,background-color] duration-300 hover:bg-ivory hover:tracking-[0.22em] ${focusRing}`}
              >
                <PlayIcon />
                Watch trailer
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setSaved(toggleWatchlist(movie.id))}
              className={`inline-flex items-center gap-2 border px-5 py-2.5 text-xs tracking-[0.16em] uppercase transition-[color,border-color,background-color,letter-spacing] duration-300 hover:tracking-[0.2em] ${focusRing} ${
                saved
                  ? 'border-brand bg-brand/12 text-brand hover:bg-brand/20'
                  : 'border-ivory/25 text-ivory hover:border-brand hover:text-brand'
              }`}
            >
              <BookmarkIcon filled={saved} />
              {saved ? 'On my list' : 'Want to watch'}
            </button>
          </div>
        </div>
      </div>

      {hasDossier ? (
        <FullBleed className="mt-16 bg-paper text-ink lg:mt-24">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
            {credits.length > 0 ? (
              <Reveal>
                <section>
                  <p className="text-[11px] tracking-[0.28em] uppercase text-ink/40">The picture</p>
                  <h3 className="mt-3 font-display text-4xl italic sm:text-5xl">Credits</h3>
                  <dl className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                    {credits.map((credit) => (
                      <div key={credit.label} className="fiche-rule group pt-5">
                        <dt className="text-[11px] tracking-[0.2em] uppercase text-ink/40 transition-colors duration-500 group-hover:text-brand">
                          {credit.label}
                        </dt>
                        <dd className="mt-3 font-serif text-lg leading-8 text-ink transition-colors duration-500 group-hover:text-ink/90">
                          {credit.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              </Reveal>
            ) : null}

            {highlights.length > 0 ? (
              <Reveal className={credits.length > 0 ? 'mt-20 lg:mt-24' : undefined}>
                <section>
                  <p className="text-[11px] tracking-[0.28em] uppercase text-ink/40">
                    From the archive
                  </p>
                  <h3 className="mt-3 font-display text-4xl italic sm:text-5xl">Notes</h3>
                  {movie.backdropUrl ? (
                    <figure className="group relative mt-10">
                      <div className="fiche-media">
                        <img
                          src={movie.backdropUrl}
                          alt=""
                          className="aspect-2/1 w-full object-cover"
                        />
                      </div>
                      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-linear-to-t from-ink/70 to-transparent px-5 py-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                        <span className="text-[11px] tracking-[0.2em] uppercase text-brand">
                          Production still
                        </span>
                      </figcaption>
                    </figure>
                  ) : null}
                  {highlights.length === 1 ? (
                    <NotePull item={highlights[0]} />
                  ) : (
                    <ul
                      className={`mt-14 grid gap-x-12 gap-y-14 ${
                        highlights.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 xl:grid-cols-3'
                      }`}
                    >
                      {highlights.map((item, index) => (
                        <li key={`${item.kind}-${index}`}>
                          <NoteCard item={item} index={index} />
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </Reveal>
            ) : null}

            {plotParagraphs.length > 0 ? (
              <Reveal
                className={
                  credits.length > 0 || highlights.length > 0 ? 'mt-20 lg:mt-24' : undefined
                }
              >
                <section>
                  <p className="text-[11px] tracking-[0.28em] uppercase text-ink/40">Synopsis</p>
                  <h3 className="mt-3 font-display text-4xl italic sm:text-5xl">The story</h3>
                  <div className="mt-10 max-w-3xl border-l border-brand/70 pl-8 sm:pl-10">
                    <p className="font-display text-2xl italic leading-snug text-ink sm:text-3xl">
                      {plotParagraphs[0]}
                    </p>
                    {plotParagraphs.slice(1).map((paragraph) => (
                      <p
                        key={paragraph.slice(0, 48)}
                        className="mt-6 font-serif text-lg leading-8 text-ink/75"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              </Reveal>
            ) : null}
          </div>
        </FullBleed>
      ) : null}

      {movie.cast.length > 0 ? (
        <div className="mt-16 lg:mt-20">
          <HorizontalCarousel title="Main cast">
            {movie.cast.map((person) => (
              <CastCard key={person.id} person={person} />
            ))}
          </HorizontalCarousel>
        </div>
      ) : null}

      {similar.length > 0 ? (
        <div className="mt-16">
          <HorizontalCarousel title="Similar titles">
            {similar.map((item) => (
              <SimilarCard
                key={item.id}
                movie={item}
                onPrefetch={() => prefetch(item.id)}
              />
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

function PosterPlate({
  posterUrl,
  title,
  hasTrailer,
  onPlay,
}: {
  posterUrl: string | null
  title: string
  hasTrailer: boolean
  onPlay: () => void
}) {
  const frame = (
    <>
      <div className="fiche-media bg-ink-soft">
        {posterUrl ? (
          <img src={posterUrl} alt="" className="aspect-2/3 w-full object-cover" />
        ) : (
          <div className="flex aspect-2/3 items-center justify-center text-sm text-muted">
            No poster
          </div>
        )}
      </div>
      <CropMarks />
      {hasTrailer ? (
        <span className="pointer-events-none absolute inset-0 flex items-end bg-linear-to-t from-ink/75 via-ink/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="flex items-center gap-2 px-4 py-3.5 text-[11px] tracking-[0.18em] uppercase text-brand">
            <PlayIcon />
            Watch trailer
          </span>
        </span>
      ) : null}
    </>
  )

  const shell =
    'group relative mx-auto block w-full max-w-72 ring-1 ring-ivory/10 transition-[box-shadow] duration-500 hover:ring-brand/50 lg:mx-0 lg:max-w-none'

  if (hasTrailer) {
    return (
      <button
        type="button"
        onClick={onPlay}
        aria-label={`Watch trailer for ${title}`}
        className={`${shell} ${focusRing} cursor-pointer border-0 bg-transparent p-0 text-left`}
      >
        {frame}
      </button>
    )
  }

  return <div className={shell}>{frame}</div>
}

function CropMarks() {
  const mark = 'pointer-events-none absolute h-3.5 w-3.5 border-brand opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100'
  return (
    <>
      <span className={`${mark} -left-px -top-px border-t border-l`} />
      <span className={`${mark} -right-px -top-px border-t border-r`} />
      <span className={`${mark} -bottom-px -left-px border-b border-l`} />
      <span className={`${mark} -right-px -bottom-px border-b border-r`} />
    </>
  )
}

function NotePull({ item }: { item: MovieHighlight }) {
  const kicker = highlightKicker(item.kind)

  return (
    <blockquote className="group relative mt-10 max-w-2xl">
      <span
        className="font-display text-[8rem] leading-[0.7] text-brand/30 transition-colors duration-500 group-hover:text-brand/55 sm:text-[10rem]"
        aria-hidden
      >
        “
      </span>
      {kicker ? (
        <p className="-mt-4 text-[11px] tracking-[0.22em] uppercase text-ink/40 transition-colors duration-500 group-hover:text-brand">
          {kicker}
        </p>
      ) : null}
      <p className="mt-4 font-display text-3xl italic leading-snug text-ink sm:text-4xl">
        {item.text}
      </p>
    </blockquote>
  )
}

function NoteCard({ item, index }: { item: MovieHighlight; index: number }) {
  const kicker = highlightKicker(item.kind)

  return (
    <article className="fiche-rule group pt-6">
      <p className="font-display text-4xl italic leading-none text-brand/80 transition-colors duration-500 group-hover:text-brand">
        {String(index + 1).padStart(2, '0')}
      </p>
      {kicker ? (
        <p className="mt-5 text-[11px] tracking-[0.2em] uppercase text-ink/40 transition-colors duration-500 group-hover:text-brand">
          {kicker}
        </p>
      ) : null}
      <p className="mt-4 font-display text-2xl italic leading-snug text-ink">{item.text}</p>
    </article>
  )
}

function SimilarCard({ movie, onPrefetch }: { movie: Movie; onPrefetch: () => void }) {
  return (
    <Link
      to={paths.movie(movie.id)}
      onMouseEnter={onPrefetch}
      onFocus={onPrefetch}
      className={`group w-40 shrink-0 sm:w-44 ${focusRing}`}
    >
      <div className="fiche-media bg-ink-soft ring-1 ring-ivory/10 transition-[box-shadow] duration-500 group-hover:ring-brand/45 group-focus-visible:ring-brand/45">
        {movie.posterUrl ? (
          <img src={movie.posterUrl} alt="" className="aspect-2/3 w-full object-cover" />
        ) : (
          <div className="flex aspect-2/3 items-center justify-center text-xs text-muted">
            No poster
          </div>
        )}
      </div>
      <p className="mt-2.5 truncate font-serif text-sm text-ivory transition-colors duration-300 group-hover:text-brand group-focus-visible:text-brand">
        {movie.title}
      </p>
      <p className="text-xs text-muted">{movie.releaseYear ?? ''}</p>
    </Link>
  )
}

function FullBleed({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 ${className ?? ''}`}>
      {children}
    </div>
  )
}

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`profile-reveal ${visible ? 'is-in' : ''} ${className}`}>
      {children}
    </div>
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
    parts.push({ key: 'genres', node: movie.genres.join(' · ') })
  }
  if (movie.certification) {
    parts.push({
      key: 'cert',
      node: (
        <span className="border border-ivory/30 px-1.5 py-0.5 text-[11px] tracking-wide text-ivory/80">
          {movie.certification}
        </span>
      ),
    })
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
      {parts.map((part, index) => (
        <span key={part.key} className="inline-flex items-center gap-3">
          {index > 0 ? <span className="h-3.5 w-px bg-ivory/20" aria-hidden /> : null}
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
    <div className="group w-36 shrink-0">
      <div className="fiche-media bg-ink-soft ring-1 ring-ivory/10 transition-[box-shadow] duration-500 group-hover:ring-brand/40">
        {showPhoto ? (
          <img
            src={person.photoUrl ?? undefined}
            alt=""
            className="aspect-3/4 w-full object-cover object-top"
            onError={() => setPhotoFailed(true)}
          />
        ) : (
          <div className="aspect-3/4">
            <PersonPlaceholder />
          </div>
        )}
      </div>
      <p className="mt-3 truncate font-serif text-sm text-ivory transition-colors duration-300 group-hover:text-brand">
        {person.name}
      </p>
      <p className="truncate text-[11px] tracking-wide text-muted">{person.character || '—'}</p>
    </div>
  )
}

function highlightKicker(kind: MovieHighlight['kind']): string | null {
  if (kind === 'bolivia') return 'On location'
  if (kind === 'true-story') return 'True story'
  return null
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
  return values.join(' · ')
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
