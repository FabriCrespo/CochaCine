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
  tagline_en: string
  poster_url: string
  backdrop_url: string
  trailer_youtube_key: string
  director_name: string
  notes: string
}

type AdminEditorProps = {
  movie: Movie
  source: MovieDetail | undefined
  override: MovieOverride | null | undefined
}

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
      setFlash('Guardado')
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
      tagline: source?.tagline ?? '',
      poster: source?.posterUrl ?? movie.posterUrl ?? '',
      backdrop: source?.backdropUrl ?? '',
      trailer: source?.trailerYoutubeKey ?? '',
      director: source?.director?.name ?? '',
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
      // el error lo muestra `error`
    }
  }

  async function handleDelete() {
    if (!override) return
    if (!window.confirm('¿Borrar la corrección y volver a TMDB?')) return
    try {
      await remove.mutateAsync(movie.id)
      setDraft(emptyDraft())
      setFlash('Volviste a TMDB')
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
          <p className="text-sm text-brand/60">{movie.releaseYear ?? 's/año'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={paths.movie(movie.id)}
            target="_blank"
            rel="noreferrer"
            className="border border-brand/40 px-3 py-1.5 text-xs tracking-[0.16em] uppercase text-brand/80 hover:border-brand"
          >
            Ver ficha
          </Link>
          {override ? (
            <button
              type="button"
              onClick={() => void handleDelete()}
              className="border border-red-400/40 px-3 py-1.5 text-xs tracking-[0.16em] uppercase text-red-200 hover:border-red-300"
            >
              Borrar override
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[160px_1fr]">
        <div className="ring-1 ring-brand/30">
          {(draft.poster_url || hint.poster) ? (
            <img
              src={draft.poster_url || hint.poster}
              alt=""
              className="aspect-2/3 w-full object-cover"
            />
          ) : (
            <div className="flex aspect-2/3 items-center justify-center bg-ink-soft text-xs text-brand/50">
              Sin póster
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Field
            label="Título EN"
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

      <label className="block">
        <span className="mb-1 flex items-center justify-between text-xs tracking-[0.16em] uppercase text-brand/70">
          Sinopsis EN
          <button
            type="button"
            onClick={() => field('overview_en', hint.overview)}
            className="tracking-normal text-brand/50 lowercase hover:text-brand"
          >
            copiar TMDB
          </button>
        </span>
        <textarea
          value={draft.overview_en}
          onChange={(event) => field('overview_en', event.target.value)}
          rows={9}
          placeholder={hint.overview || 'Vacío = se muestra TMDB/IMDb'}
          className="w-full border border-brand/40 bg-ink px-3 py-2 text-sm leading-relaxed text-brand outline-none placeholder:text-brand/35 focus:border-brand"
        />
      </label>

      <Field
        label="Póster (URL)"
        hint={hint.poster}
        value={draft.poster_url}
        onChange={(value) => field('poster_url', value)}
        onUseHint={() => field('poster_url', hint.poster)}
      />

      <label className="flex cursor-pointer items-center justify-center border border-dashed border-brand/40 px-3 py-2 text-xs tracking-[0.16em] uppercase text-brand/80 hover:border-brand">
        {upload.isPending ? 'Subiendo...' : 'Subir póster'}
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
        label="Trailer YouTube (id o URL)"
        hint={hint.trailer}
        value={draft.trailer_youtube_key}
        onChange={(value) => field('trailer_youtube_key', value)}
        onBlur={() => field('trailer_youtube_key', youtubeKeyFromInput(draft.trailer_youtube_key))}
        onUseHint={() => field('trailer_youtube_key', hint.trailer)}
      />

      <label className="block">
        <span className="mb-1 block text-xs tracking-[0.16em] uppercase text-brand/70">
          Notas internas
        </span>
        <input
          value={draft.notes}
          onChange={(event) => field('notes', event.target.value)}
          placeholder="Solo para vos"
          className="w-full border border-brand/40 bg-ink px-3 py-2 text-sm text-brand outline-none placeholder:text-brand/35 focus:border-brand"
        />
      </label>

      <div className="sticky bottom-0 z-10 -mx-1 flex flex-wrap items-center gap-3 border-t border-brand/20 bg-ink py-3">
        <button
          type="submit"
          disabled={save.isPending || !dirty}
          className="border border-brand bg-brand px-4 py-2 text-sm tracking-[0.18em] uppercase text-ink disabled:opacity-40"
        >
          {save.isPending ? 'Guardando...' : 'Guardar'}
        </button>
        <p className="text-xs text-brand/50">Ctrl+S</p>
        {flash ? <p className="text-sm text-brand">{flash}</p> : null}
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
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
}

function Field({ label, hint, value, onChange, onUseHint, onBlur }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-xs tracking-[0.16em] uppercase text-brand/70">
        {label}
        {hint ? (
          <button
            type="button"
            onClick={onUseHint}
            className="tracking-normal text-brand/50 lowercase hover:text-brand"
          >
            copiar TMDB
          </button>
        ) : null}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={hint || 'Vacío = TMDB'}
        className="w-full border border-brand/40 bg-ink px-3 py-2 text-sm text-brand outline-none placeholder:text-brand/35 focus:border-brand"
      />
    </label>
  )
}

function emptyDraft(): Draft {
  return {
    title_en: '',
    overview_en: '',
    tagline_en: '',
    poster_url: '',
    backdrop_url: '',
    trailer_youtube_key: '',
    director_name: '',
    notes: '',
  }
}

function draftFrom(override: MovieOverride | null | undefined): Draft {
  if (!override) return emptyDraft()
  return {
    title_en: override.title_en ?? '',
    overview_en: override.overview_en ?? '',
    tagline_en: override.tagline_en ?? '',
    poster_url: override.poster_url ?? '',
    backdrop_url: override.backdrop_url ?? '',
    trailer_youtube_key: override.trailer_youtube_key ?? '',
    director_name: override.director_name ?? '',
    notes: override.notes ?? '',
  }
}

function toWrite(tmdbId: number, draft: Draft): MovieOverrideWrite {
  return {
    tmdb_id: tmdbId,
    title_en: blank(draft.title_en),
    overview_en: blank(draft.overview_en),
    tagline_en: blank(draft.tagline_en),
    poster_url: blank(draft.poster_url),
    backdrop_url: blank(draft.backdrop_url),
    trailer_youtube_key: blank(youtubeKeyFromInput(draft.trailer_youtube_key)),
    director_name: blank(draft.director_name),
    notes: blank(draft.notes),
  }
}

function blank(value: string): string | null {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function sameDraft(draft: Draft, override: MovieOverride | null | undefined): boolean {
  const current = draftFrom(override)
  return (Object.keys(current) as Array<keyof Draft>).every((key) => draft[key] === current[key])
}
