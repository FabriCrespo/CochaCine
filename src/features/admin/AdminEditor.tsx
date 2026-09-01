import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { Link } from 'react-router'
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

type AdminEditorProps = {
  movie: Movie
  source: MovieDetail | undefined
  override: MovieOverride | null | undefined
}

const inputClass =
  'w-full border border-brand/40 bg-ink px-3 py-2 text-sm text-brand outline-none placeholder:text-brand/35 focus:border-brand'

export function AdminEditor({ movie, source, override }: AdminEditorProps) {
  const save = useSaveOverride()
  const remove = useDeleteOverride()
  const upload = useUploadPoster()
  const [draft, setDraft] = useState<Draft>(() => draftFrom(override))
  const [flash, setFlash] = useState<string | null>(null)
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
      className="flex min-h-0 flex-1 flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        void persist(draft)
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-brand/60">TMDB {movie.id}</p>
          <h2 className="mt-1 text-xl text-brand">{movie.title}</h2>
          <p className="text-sm text-brand/60">{movie.releaseYear ?? 'no year'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={paths.movie(movie.id)}
            target="_blank"
            rel="noreferrer"
            className="border border-brand/40 px-3 py-1.5 text-xs tracking-[0.16em] uppercase text-brand/80 hover:border-brand"
          >
            View page
          </Link>
          {override ? (
            <button
              type="button"
              onClick={() => void handleDelete()}
              className="border border-red-400/40 px-3 py-1.5 text-xs tracking-[0.16em] uppercase text-red-200 hover:border-red-300"
            >
              Delete override
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[160px_1fr]">
        <div className="ring-1 ring-brand/30">
          {draft.poster_url || hint.poster ? (
            <img
              src={draft.poster_url || hint.poster}
              alt=""
              className="aspect-2/3 w-full object-cover"
            />
          ) : (
            <div className="flex aspect-2/3 items-center justify-center bg-ink-soft text-xs text-brand/50">
              No poster
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Field
            label="Title EN"
            hint={hint.title}
            value={draft.title_en}
            onChange={(value) => field('title_en', value)}
            onUseHint={() => field('title_en', hint.title)}
          />
          <Field
            label="Director"
            hint={hint.director}
            value={draft.director_name}
            onChange={(value) => field('director_name', value)}
            onUseHint={() => field('director_name', hint.director)}
          />
          <Field
            label="Tagline EN"
            hint={hint.tagline}
            value={draft.tagline_en}
            onChange={(value) => field('tagline_en', value)}
            onUseHint={() => field('tagline_en', hint.tagline)}
          />
        </div>
      </div>

      <TextArea
        label="Short plot EN"
        hint={hint.overview}
        value={draft.overview_en}
        onChange={(value) => field('overview_en', value)}
        onUseHint={() => field('overview_en', hint.overview)}
        rows={5}
        placeholder={hint.overview || 'Empty = TMDB/IMDb. Used in the hero and catalog.'}
      />

      <TextArea
        label="In-depth plot EN"
        hint={hint.plot}
        value={draft.plot_en}
        onChange={(value) => field('plot_en', value)}
        onUseHint={() => field('plot_en', hint.plot)}
        rows={8}
        placeholder="Empty = short plot. Shown in the Plot section on the title page."
      />

      <p className="pt-1 text-xs tracking-[0.16em] uppercase text-brand/50">Facts</p>
      <div className="grid gap-3 sm:grid-cols-2">
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

      <TextArea
        label="Trivia"
        hint={hint.highlights}
        value={draft.highlights_en}
        onChange={(value) => field('highlights_en', value)}
        onUseHint={() => field('highlights_en', hint.highlights)}
        rows={6}
        placeholder="One fact per line. Replaces the trivia box on the title page."
      />

      <Field
        label="Poster (URL)"
        hint={hint.poster}
        value={draft.poster_url}
        onChange={(value) => field('poster_url', value)}
        onUseHint={() => field('poster_url', hint.poster)}
      />

      <label className="flex cursor-pointer items-center justify-center border border-dashed border-brand/40 px-3 py-2 text-xs tracking-[0.16em] uppercase text-brand/80 hover:border-brand">
        {upload.isPending ? 'Uploading...' : 'Upload poster'}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => void handleUpload(event)}
        />
      </label>

      <Field
        label="Backdrop (URL)"
        hint={hint.backdrop}
        value={draft.backdrop_url}
        onChange={(value) => field('backdrop_url', value)}
        onUseHint={() => field('backdrop_url', hint.backdrop)}
      />

      <Field
        label="Trailer YouTube (id or URL)"
        hint={hint.trailer}
        value={draft.trailer_youtube_key}
        onChange={(value) => field('trailer_youtube_key', value)}
        onBlur={() => field('trailer_youtube_key', youtubeKeyFromInput(draft.trailer_youtube_key))}
        onUseHint={() => field('trailer_youtube_key', hint.trailer)}
      />

      <label className="block">
        <span className="mb-1 block text-xs tracking-[0.16em] uppercase text-brand/70">
          Internal notes
        </span>
        <input
          value={draft.notes}
          onChange={(event) => field('notes', event.target.value)}
          placeholder="Just for you"
          className={inputClass}
        />
      </label>

      <div className="sticky bottom-0 z-10 -mx-1 flex flex-wrap items-center gap-3 border-t border-brand/20 bg-ink py-3">
        <button
          type="submit"
          disabled={save.isPending || !dirty}
          className="border border-brand bg-brand px-4 py-2 text-sm tracking-[0.18em] uppercase text-ink disabled:opacity-40"
        >
          {save.isPending ? 'Saving...' : 'Save'}
        </button>
        <p className="text-xs text-brand/50">Ctrl+S</p>
        {flash ? <p className="text-sm text-brand">{flash}</p> : null}
        {error ? (
          <p className="text-sm text-red-300">
            {error}
            {/column|schema cache/i.test(error) ? (
              <span className="mt-1 block text-red-200/80">
                Run supabase/migrations/20260901_movie_override_details.sql in the Supabase SQL editor, then save again.
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
}

function Field({
  label,
  hint,
  value,
  onChange,
  onUseHint,
  onBlur,
  type = 'text',
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
        placeholder={type === 'date' ? undefined : hint || 'Empty = TMDB'}
        className={inputClass}
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
        className={`${inputClass} leading-relaxed`}
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
    <span className="mb-1 flex items-center justify-between text-xs tracking-[0.16em] uppercase text-brand/70">
      {label}
      {hint ? (
        <button
          type="button"
          onClick={onUseHint}
          className="tracking-normal text-brand/50 lowercase hover:text-brand"
        >
          copy TMDB
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
