import { AppError } from '../http/errors.ts'
import { requireWriteClient } from './adminClient.ts'
import { getSupabase } from './client.ts'
import {
  MOVIE_MEDIA_BUCKET,
  MOVIE_OVERRIDE_COLUMNS,
  MOVIE_OVERRIDE_LEGACY_COLUMNS,
  MOVIE_OVERRIDES_TABLE,
  normalizeMovieOverride,
  toLegacyOverrideWrite,
  type MovieOverride,
  type MovieOverrideLegacyWrite,
  type MovieOverrideWrite,
} from './types.ts'

export async function fetchMovieOverride(tmdbId: number): Promise<MovieOverride | null> {
  const supabase = getSupabase()
  if (!supabase || tmdbId <= 0) return null

  const row = await selectOverride((columns) =>
    supabase.from(MOVIE_OVERRIDES_TABLE).select(columns).eq('tmdb_id', tmdbId).maybeSingle(),
  )

  return row
}

export async function fetchMovieOverrides(
  tmdbIds: number[],
): Promise<Map<number, MovieOverride>> {
  const supabase = getSupabase()
  const map = new Map<number, MovieOverride>()
  if (!supabase || tmdbIds.length === 0) return map

  const unique = [...new Set(tmdbIds.filter((id) => id > 0))]
  const chunkSize = 100

  for (let index = 0; index < unique.length; index += chunkSize) {
    const chunk = unique.slice(index, index + chunkSize)
    const rows = await selectOverrideList((columns) =>
      supabase.from(MOVIE_OVERRIDES_TABLE).select(columns).in('tmdb_id', chunk),
    )
    for (const row of rows) {
      map.set(row.tmdb_id, row)
    }
  }

  return map
}

export async function fetchAllMovieOverrides(): Promise<MovieOverride[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  return selectOverrideList((columns) =>
    supabase.from(MOVIE_OVERRIDES_TABLE).select(columns).order('updated_at', { ascending: false }),
  )
}

export async function upsertMovieOverride(payload: MovieOverrideWrite): Promise<MovieOverride> {
  const supabase = requireWriteClient()
  const full = await supabase
    .from(MOVIE_OVERRIDES_TABLE)
    .upsert(payload, { onConflict: 'tmdb_id' })
    .select(MOVIE_OVERRIDE_COLUMNS)
    .single()

  if (!full.error && full.data) {
    return normalizeMovieOverride(full.data)
  }

  if (!isMissingColumnError(full.error?.message)) {
    throw new AppError(full.error?.message ?? 'Could not save the override.', 'HTTP', null)
  }

  const legacyPayload: MovieOverrideLegacyWrite = toLegacyOverrideWrite(payload)
  const legacy = await supabase
    .from(MOVIE_OVERRIDES_TABLE)
    .upsert(legacyPayload, { onConflict: 'tmdb_id' })
    .select(MOVIE_OVERRIDE_LEGACY_COLUMNS)
    .single()

  if (legacy.error || !legacy.data) {
    throw new AppError(legacy.error?.message ?? 'Could not save the override.', 'HTTP', null)
  }

  return normalizeMovieOverride(legacy.data)
}

export async function deleteMovieOverride(tmdbId: number): Promise<void> {
  const supabase = requireWriteClient()
  const { error } = await supabase.from(MOVIE_OVERRIDES_TABLE).delete().eq('tmdb_id', tmdbId)

  if (error) {
    throw new AppError(error.message, 'HTTP', null)
  }
}

export async function uploadMoviePoster(tmdbId: number, file: File): Promise<string> {
  const supabase = requireWriteClient()
  const extension = extensionFor(file)
  const path = `${tmdbId}/poster-${Date.now()}.${extension}`

  const { error } = await supabase.storage.from(MOVIE_MEDIA_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type || 'image/jpeg',
  })

  if (error) {
    throw new AppError(error.message, 'HTTP', null)
  }

  const { data } = supabase.storage.from(MOVIE_MEDIA_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

type SelectResult<T> = PromiseLike<{ data: T; error: { message: string } | null }>

async function selectOverride(
  run: (columns: string) => SelectResult<Partial<MovieOverride> | null>,
): Promise<MovieOverride | null> {
  const full = await run(MOVIE_OVERRIDE_COLUMNS)
  if (!full.error) {
    return full.data ? normalizeMovieOverride(full.data as MovieOverride) : null
  }

  if (!isMissingColumnError(full.error.message)) {
    console.warn('[Supabase] override', full.error.message)
    return null
  }

  const legacy = await run(MOVIE_OVERRIDE_LEGACY_COLUMNS)
  if (legacy.error) {
    console.warn('[Supabase] override', legacy.error.message)
    return null
  }

  return legacy.data ? normalizeMovieOverride(legacy.data as MovieOverride) : null
}

async function selectOverrideList(
  run: (columns: string) => SelectResult<Array<Partial<MovieOverride>> | null>,
): Promise<MovieOverride[]> {
  const full = await run(MOVIE_OVERRIDE_COLUMNS)
  if (!full.error) {
    return (full.data ?? []).map((row) => normalizeMovieOverride(row as MovieOverride))
  }

  if (!isMissingColumnError(full.error.message)) {
    console.warn('[Supabase] overrides', full.error.message)
    return []
  }

  const legacy = await run(MOVIE_OVERRIDE_LEGACY_COLUMNS)
  if (legacy.error) {
    console.warn('[Supabase] overrides', legacy.error.message)
    return []
  }

  return (legacy.data ?? []).map((row) => normalizeMovieOverride(row as MovieOverride))
}

function isMissingColumnError(message: string | undefined): boolean {
  if (!message) return false
  return /column|schema cache/i.test(message)
}

function extensionFor(file: File): string {
  if (file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')) return 'png'
  if (file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp')) return 'webp'
  return 'jpg'
}
