import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { Link } from 'react-router'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs.tsx'
import type { Movie, MovieDetail } from '../../domain/movie.ts'
import type { MovieOverride, MovieOverrideWrite } from '../../api/supabase/types.ts'
import { paths } from '../../lib/paths.ts'
import { youtubeKeyFromInput } from '../../lib/youtube.ts'
import {
  useDeleteOverride,
  useSaveOverride,
  useUploadPoster,
} from '../../query/overrides/useOverrides.ts'

type Draft = {
  title_en: string
  overview_en: string
  plot_en: string
  tagline_en: string
  poster_url: string
  backdrop_url: string
  trailer_youtube_key: string
  director_name: string
  writers: string
  production: string
  countries: string
  languages: string
  genres: string
  release_date: string
  runtime_minutes: string
  certification: string
  highlights_en: string
  notes: string
}

type Pane = 'story' | 'picture' | 'facts' | 'notes'

type AdminEditorProps = {
  movie: Movie
  source: MovieDetail | undefined
  override: MovieOverride | null | undefined
}

const PANES: { id: Pane; label: string }[] = [
  { id: 'story', label: 'Story' },
  { id: 'picture', label: 'Picture' },
  { id: 'facts', label: 'Facts' },
  { id: 'notes', label: 'Notes' },
]

const fieldClass =
  'w-full border-0 border-b border-ink/15 bg-transparent py-2 font-serif text-[15px] text-ink outline-none placeholder:text-ink/30 focus:border-brand'

const areaClass = `${fieldClass} resize-y leading-7`

export function AdminEditor({ movie, source, override }: AdminEditorProps) {
  const save = useSaveOverride()
  const remove = useDeleteOverride()
  const upload = useUploadPoster()
  const [draft, setDraft] = useState<Draft>(() => draftFrom(override))
  const [flash, setFlash] = useState<string | null>(null)
  const [pane, setPane] = useState<Pane>('story')
  const draftRef = useRef(draft)
  draftRef.current = draft

  useEffect(() => {
    setDraft(draftFrom(override))
    save.reset()
    remove.reset()
  }, [override?.updated_at, movie.id])

  const persistRef = useRef<(next: Draft) => Promise<void>>(async () => {})

  async function persist(next: Draft) {
    try {
      await save.mutateAsync(toWrite(movie.id, next))
      setFlash('Saved')
      window.setTimeout(() => setFlash(null), 1600)
    } catch {
      setFlash(null)
    }
  }
  persistRef.current = persist

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        void persistRef.current(draftRef.current)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const hint = useMemo(
    () => ({
      title: source?.title ?? movie.title,
      overview: source?.overview ?? movie.overview,
      plot: source?.plot ?? source?.overview ?? movie.overview,
      tagline: source?.tagline ?? '',
      poster: source?.posterUrl ?? movie.posterUrl ?? '',
      backdrop: source?.backdropUrl ?? '',
      trailer: source?.trailerYoutubeKey ?? '',
      director: source?.director?.name ?? '',
      writers: joinHint(source?.writers),
      production: joinHint(source?.productionCompanies),
      countries: joinHint(source?.countries),
      languages: joinHint(source?.languages),
      genres: joinHint(source?.genres),
      release_date: source?.releaseDate?.slice(0, 10) ?? '',
      runtime_minutes:
        source?.runtimeMinutes != null && source.runtimeMinutes > 0
          ? String(source.runtimeMinutes)
          : '',
      certification: source?.certification ?? '',
      highlights: (source?.highlights ?? []).map((item) => item.text).join('\n'),
    }),
    [movie, source],
  )

  const dirty = !sameDraft(draft, override)
  const error = save.error?.message ?? remove.error?.message ?? upload.error?.message ?? null
  const posterSrc = draft.poster_url || hint.poster

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const url = await upload.mutateAsync({ tmdbId: movie.id, file })
      const next = { ...draft, poster_url: url }
      setDraft(next)
      await persist(next)
    } catch {
      // shown via `error`
    }
  }

  async function handleDelete() {
    if (!override) return
    if (!window.confirm('Delete this override and revert to TMDB?')) return
    try {
      await remove.mutateAsync(movie.id)
      setDraft(emptyDraft())
      setFlash('Reverted to TMDB')
      window.setTimeout(() => setFlash(null), 1600)
    } catch {
      setFlash(null)
    }
  }

  function field<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  return (
    <form
      className="flex min-h-[calc(100vh-4.5rem)] flex-col"
      onSubmit={(event) => {
        event.preventDefault()
        void persist(draft)
      }}
    >
      <div className="border-b border-ink/10 px-5 py-6 sm:px-8 lg:px-10">
        <Breadcrumbs
          tone="paper"
          items={[
            { label: 'Home', to: paths.home },
            { label: 'Editor', to: paths.admin },
            { label: movie.title },
          ]}
        />
        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.22em] uppercase text-ink/40">
              TMDB {movie.id}
              {override ? ' · override' : ' · TMDB only'}
            </p>
            <h2 className="mt-2 font-display text-3xl italic leading-tight text-ink sm:text-4xl">
              {movie.title}
            </h2>
            <p className="mt-1 font-serif text-ink/50">{movie.releaseYear ?? 'No year'}</p>
          </div>
          <Link
            to={paths.movie(movie.id)}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] tracking-[0.18em] uppercase text-ink/45 hover:text-ink"
          >
            View page →
          </Link>
        </div>

        <div className="mt-6 flex gap-1">
          {PANES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPane(item.id)}
              className={
                pane === item.id
                  ? 'bg-ink px-3 py-1.5 text-[11px] tracking-[0.16em] uppercase text-paper'
                  : 'px-3 py-1.5 text-[11px] tracking-[0.16em] uppercase text-ink/40 hover:text-ink'
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        {pane === 'story' ? (
          <div className="mx-auto max-w-3xl space-y-8">
            <Field
              label="Title"
              hint={hint.title}
              value={draft.title_en}
              onChange={(value) => field('title_en', value)}
              onUseHint={() => field('title_en', hint.title)}
            />
            <div className="grid gap-8 sm:grid-cols-2">
              <Field
                label="Director"
                hint={hint.director}
                value={draft.director_name}
                onChange={(value) => field('director_name', value)}
                onUseHint={() => field('director_name', hint.director)}
              />
              <Field
                label="Tagline"
                hint={hint.tagline}
                value={draft.tagline_en}
                onChange={(value) => field('tagline_en', value)}
                onUseHint={() => field('tagline_en', hint.tagline)}
              />
            </div>
            <TextArea
              label="Short plot"
              hint={hint.overview}
              value={draft.overview_en}
              onChange={(value) => field('overview_en', value)}
              onUseHint={() => field('overview_en', hint.overview)}
              rows={5}
              placeholder={hint.overview || 'Empty keeps TMDB. Used in the catalog and the hero.'}
            />
            <TextArea
              label="In-depth plot"
              hint={hint.plot}
              value={draft.plot_en}
              onChange={(value) => field('plot_en', value)}
              onUseHint={() => field('plot_en', hint.plot)}
              rows={10}
              placeholder="Empty uses the short plot. Shown in the Plot section."
            />
          </div>
        ) : null}

        {pane === 'picture' ? (
          <div className="mx-auto grid max-w-4xl gap-10 lg:grid-cols-[14rem_1fr]">
            <label className="group relative block cursor-pointer">
              {posterSrc ? (
                <img src={posterSrc} alt="" className="aspect-2/3 w-full object-cover" />
              ) : (
                <div className="flex aspect-2/3 items-center justify-center bg-ink/5 font-serif text-sm text-ink/40">
                  No poster
                </div>
              )}
              <span className="absolute inset-x-0 bottom-0 bg-ink/70 py-2 text-center text-[10px] tracking-[0.18em] uppercase text-ivory opacity-0 transition-opacity group-hover:opacity-100">
                {upload.isPending ? 'Uploading...' : 'Upload'}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => void handleUpload(event)}
              />
            </label>
            <div className="space-y-8">
              <Field
                label="Poster URL"
                hint={hint.poster}
                value={draft.poster_url}
                onChange={(value) => field('poster_url', value)}
                onUseHint={() => field('poster_url', hint.poster)}
              />
              <Field
                label="Backdrop URL"
                hint={hint.backdrop}
                value={draft.backdrop_url}
                onChange={(value) => field('backdrop_url', value)}
                onUseHint={() => field('backdrop_url', hint.backdrop)}
              />
              <Field
                label="Trailer (YouTube id or URL)"
                hint={hint.trailer}
                value={draft.trailer_youtube_key}
                onChange={(value) => field('trailer_youtube_key', value)}
                onBlur={() =>
                  field('trailer_youtube_key', youtubeKeyFromInput(draft.trailer_youtube_key))
                }
                onUseHint={() => field('trailer_youtube_key', hint.trailer)}
              />
            </div>
          </div>
        ) : null}

        {pane === 'facts' ? (
          <div className="mx-auto grid max-w-3xl gap-8 sm:grid-cols-2">
            <Field
              label="Release date"
              type="date"
              hint={hint.release_date}
              value={draft.release_date}
              onChange={(value) => field('release_date', value)}
              onUseHint={() => field('release_date', hint.release_date)}
            />
            <Field
              label="Runtime (minutes)"
              type="number"
              hint={hint.runtime_minutes}
              value={draft.runtime_minutes}
              onChange={(value) => field('runtime_minutes', value)}
              onUseHint={() => field('runtime_minutes', hint.runtime_minutes)}
            />
            <Field
              label="Certification"
              hint={hint.certification}
              value={draft.certification}
              onChange={(value) => field('certification', value)}
              onUseHint={() => field('certification', hint.certification)}
            />
            <Field
              label="Genres"
              hint={hint.genres}
              value={draft.genres}
              onChange={(value) => field('genres', value)}
              onUseHint={() => field('genres', hint.genres)}
            />
            <Field
              label="Screenplay"
              hint={hint.writers}
              value={draft.writers}
              onChange={(value) => field('writers', value)}
              onUseHint={() => field('writers', hint.writers)}
            />
            <Field
              label="Production"
              hint={hint.production}
              value={draft.production}
              onChange={(value) => field('production', value)}
              onUseHint={() => field('production', hint.production)}
            />
            <Field
              label="Country"
              hint={hint.countries}
              value={draft.countries}
              onChange={(value) => field('countries', value)}
              onUseHint={() => field('countries', hint.countries)}
            />
            <Field
              label="Language"
              hint={hint.languages}
              value={draft.languages}
              onChange={(value) => field('languages', value)}
              onUseHint={() => field('languages', hint.languages)}
            />
          </div>
        ) : null}

        {pane === 'notes' ? (
          <div className="mx-auto max-w-3xl space-y-8">
            <TextArea
              label="Trivia"
              hint={hint.highlights}
              value={draft.highlights_en}
              onChange={(value) => field('highlights_en', value)}
              onUseHint={() => field('highlights_en', hint.highlights)}
              rows={8}
              placeholder="One fact per line. Replaces the trivia box on the title page."
            />
            <Field
              label="Internal notes"
              hint=""
              value={draft.notes}
              onChange={(value) => field('notes', value)}
              onUseHint={() => undefined}
              placeholder="Just for you. Not shown on the site."
            />
            {override ? (
              <button
                type="button"
                onClick={() => void handleDelete()}
                className="text-[11px] tracking-[0.18em] uppercase text-ink/35 hover:text-red-800"
              >
                Delete override · revert to TMDB
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-4 border-t border-ink/10 bg-paper/95 px-5 py-4 backdrop-blur-sm sm:px-8 lg:px-10">
        <button
          type="submit"
          disabled={save.isPending || !dirty}
          className="bg-ink px-5 py-2.5 text-[11px] tracking-[0.2em] uppercase text-paper disabled:opacity-30"
        >
          {save.isPending ? 'Saving...' : 'Save'}
        </button>
        <p className="text-[11px] tracking-[0.14em] uppercase text-ink/35">Ctrl+S</p>
        {flash ? <p className="font-serif text-sm text-ink">{flash}</p> : null}
        {dirty && !flash ? (
          <p className="font-serif text-sm text-ink/45">Unsaved</p>
        ) : null}
        {error ? (
          <p className="font-serif text-sm text-red-800">
            {error}
            {/column|schema cache/i.test(error) ? (
              <span className="mt-1 block text-red-800/70">
                Run supabase/migrations/20260901_movie_override_details.sql, then save again.
              </span>
            ) : null}
          </p>
        ) : null}
      </div>
    </form>
  )
}

type FieldProps = {
  label: string
  hint: string
  value: string
  onChange: (value: string) => void
  onUseHint: () => void
  onBlur?: () => void
  type?: 'text' | 'date' | 'number'
  placeholder?: string
}

function Field({
  label,
  hint,
  value,
  onChange,
  onUseHint,
  onBlur,
  type = 'text',
  placeholder,
}: FieldProps) {
  return (
    <label className="block">
      <LabelRow label={label} hint={hint} onUseHint={onUseHint} />
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        min={type === 'number' ? 1 : undefined}
        placeholder={type === 'date' ? undefined : placeholder ?? (hint || 'Empty = TMDB')}
        className={fieldClass}
      />
    </label>
  )
}

function TextArea({
  label,
  hint,
  value,
  onChange,
  onUseHint,
  rows,
  placeholder,
}: {
  label: string
  hint: string
  value: string
  onChange: (value: string) => void
  onUseHint: () => void
  rows: number
  placeholder: string
}) {
  return (
    <label className="block">
      <LabelRow label={label} hint={hint} onUseHint={onUseHint} />
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={areaClass}
      />
    </label>
  )
}

function LabelRow({
  label,
  hint,
  onUseHint,
}: {
  label: string
  hint: string
  onUseHint: () => void
}) {
  return (
    <span className="mb-1 flex items-center justify-between text-[11px] tracking-[0.18em] uppercase text-ink/40">
      {label}
      {hint ? (
        <button
          type="button"
          onClick={onUseHint}
          className="tracking-[0.12em] text-brand hover:text-ink"
        >
          Use TMDB
        </button>
      ) : null}
    </span>
  )
}

function emptyDraft(): Draft {
  return {
    title_en: '',
    overview_en: '',
    plot_en: '',
    tagline_en: '',
    poster_url: '',
    backdrop_url: '',
    trailer_youtube_key: '',
    director_name: '',
    writers: '',
    production: '',
    countries: '',
    languages: '',
    genres: '',
    release_date: '',
    runtime_minutes: '',
    certification: '',
    highlights_en: '',
    notes: '',
  }
}

function draftFrom(override: MovieOverride | null | undefined): Draft {
  if (!override) return emptyDraft()
  return {
    title_en: override.title_en ?? '',
    overview_en: override.overview_en ?? '',
    plot_en: override.plot_en ?? '',
    tagline_en: override.tagline_en ?? '',
    poster_url: override.poster_url ?? '',
    backdrop_url: override.backdrop_url ?? '',
    trailer_youtube_key: override.trailer_youtube_key ?? '',
    director_name: override.director_name ?? '',
    writers: override.writers ?? '',
    production: override.production ?? '',
    countries: override.countries ?? '',
    languages: override.languages ?? '',
    genres: override.genres ?? '',
    release_date: (override.release_date ?? '').slice(0, 10),
    runtime_minutes:
      override.runtime_minutes != null && override.runtime_minutes > 0
        ? String(override.runtime_minutes)
        : '',
    certification: override.certification ?? '',
    highlights_en: override.highlights_en ?? '',
    notes: override.notes ?? '',
  }
}

function toWrite(tmdbId: number, draft: Draft): MovieOverrideWrite {
  return {
    tmdb_id: tmdbId,
    title_en: blank(draft.title_en),
    overview_en: blank(draft.overview_en),
    plot_en: blank(draft.plot_en),
    tagline_en: blank(draft.tagline_en),
    poster_url: blank(draft.poster_url),
    backdrop_url: blank(draft.backdrop_url),
    trailer_youtube_key: blank(youtubeKeyFromInput(draft.trailer_youtube_key)),
    director_name: blank(draft.director_name),
    writers: blank(draft.writers),
    production: blank(draft.production),
    countries: blank(draft.countries),
    languages: blank(draft.languages),
    genres: blank(draft.genres),
    release_date: blank(draft.release_date),
    runtime_minutes: intOrNull(draft.runtime_minutes),
    certification: blank(draft.certification),
    highlights_en: blank(draft.highlights_en),
    notes: blank(draft.notes),
  }
}

function blank(value: string): string | null {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function intOrNull(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed) || parsed <= 0) return null
  return Math.round(parsed)
}

function joinHint(values: string[] | undefined): string {
  return (values ?? []).join(', ')
}

function sameDraft(draft: Draft, override: MovieOverride | null | undefined): boolean {
  const current = draftFrom(override)
  return (Object.keys(current) as Array<keyof Draft>).every((key) => draft[key] === current[key])
}
