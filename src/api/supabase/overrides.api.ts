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

type LooseResult = {
  data: unknown
  error: { message: string } | null
}

export async function fetchMovieOverride(tmdbId: number): Promise<MovieOverride | null> {
  const supabase = getSupabase()
  if (!supabase || tmdbId <= 0) return null

  const result = await selectWithFallback((columns) =>
    supabase.from(MOVIE_OVERRIDES_TABLE).select(columns).eq('tmdb_id', tmdbId).maybeSingle(),
  )

  if (result.error) {
    console.warn('[Supabase] override', tmdbId, result.error.message)
    return null
  }

  return asOverride(result.data)
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
    const result = await selectWithFallback((columns) =>
      supabase.from(MOVIE_OVERRIDES_TABLE).select(columns).in('tmdb_id', chunk),
    )

    if (result.error) {
      console.warn('[Supabase] overrides', result.error.message)
      continue
    }

    for (const row of asOverrideList(result.data)) {
      map.set(row.tmdb_id, row)
    }
  }

  return map
}

export async function fetchAllMovieOverrides(): Promise<MovieOverride[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const result = await selectWithFallback((columns) =>
    supabase.from(MOVIE_OVERRIDES_TABLE).select(columns).order('updated_at', { ascending: false }),
  )

  if (result.error) {
    throw new AppError(result.error.message, 'HTTP', null)
  }

  return asOverrideList(result.data)
}

export async function upsertMovieOverride(payload: MovieOverrideWrite): Promise<MovieOverride> {
  const supabase = requireWriteClient()
  const full = await supabase
    .from(MOVIE_OVERRIDES_TABLE)
    .upsert(payload, { onConflict: 'tmdb_id' })
    .select(MOVIE_OVERRIDE_COLUMNS)
    .single()

  if (!full.error) {
    const row = asOverride(full.data)
    if (row) return row
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

  const row = asOverride(legacy.data)
  if (legacy.error || !row) {
    throw new AppError(legacy.error?.message ?? 'Could not save the override.', 'HTTP', null)
  }

  return row
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

async function selectWithFallback(
  run: (columns: string) => PromiseLike<LooseResult>,
): Promise<LooseResult> {
  const full = await run(MOVIE_OVERRIDE_COLUMNS)
  if (!full.error || !isMissingColumnError(full.error.message)) return full
  return run(MOVIE_OVERRIDE_LEGACY_COLUMNS)
}

function asOverride(row: unknown): MovieOverride | null {
  if (!row || typeof row !== 'object') return null
  const tmdbId = (row as { tmdb_id?: unknown }).tmdb_id
  if (typeof tmdbId !== 'number' || tmdbId <= 0) return null
  return normalizeMovieOverride(row as Partial<MovieOverride> & { tmdb_id: number })
}

function asOverrideList(data: unknown): MovieOverride[] {
  if (!Array.isArray(data)) return []
  return data.flatMap((row) => {
    const override = asOverride(row)
    return override ? [override] : []
  })
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
