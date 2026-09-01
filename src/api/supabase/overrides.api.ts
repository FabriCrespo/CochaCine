import { AppError } from '../http/errors.ts'
import { requireWriteClient } from './adminClient.ts'
import { getSupabase } from './client.ts'
import {
  MOVIE_MEDIA_BUCKET,
  MOVIE_OVERRIDE_COLUMNS,
  MOVIE_OVERRIDES_TABLE,
  type MovieOverride,
  type MovieOverrideWrite,
} from './types.ts'

export async function fetchMovieOverride(tmdbId: number): Promise<MovieOverride | null> {
  const supabase = getSupabase()
  if (!supabase || tmdbId <= 0) return null

  const { data, error } = await supabase
    .from(MOVIE_OVERRIDES_TABLE)
    .select(MOVIE_OVERRIDE_COLUMNS)
    .eq('tmdb_id', tmdbId)
    .maybeSingle()

  if (error) {
    console.warn('[Supabase] override', tmdbId, error.message)
    return null
  }

  return data
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
    const { data, error } = await supabase
      .from(MOVIE_OVERRIDES_TABLE)
      .select(MOVIE_OVERRIDE_COLUMNS)
      .in('tmdb_id', chunk)

    if (error) {
      console.warn('[Supabase] overrides', error.message)
      continue
    }

    for (const row of data ?? []) {
      map.set(row.tmdb_id, row)
    }
  }

  return map
}

export async function fetchAllMovieOverrides(): Promise<MovieOverride[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data, error } = await supabase
    .from(MOVIE_OVERRIDES_TABLE)
    .select(MOVIE_OVERRIDE_COLUMNS)
    .order('updated_at', { ascending: false })

  if (error) {
    throw new AppError(error.message, 'HTTP', null)
  }

  return data ?? []
}

export async function upsertMovieOverride(payload: MovieOverrideWrite): Promise<MovieOverride> {
  const supabase = requireWriteClient()
  const { data, error } = await supabase
    .from(MOVIE_OVERRIDES_TABLE)
    .upsert(payload, { onConflict: 'tmdb_id' })
    .select(MOVIE_OVERRIDE_COLUMNS)
    .single()

  if (error || !data) {
    throw new AppError(error?.message ?? 'Could not save the override.', 'HTTP', null)
  }

  return data
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

function extensionFor(file: File): string {
  if (file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')) return 'png'
  if (file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp')) return 'webp'
  return 'jpg'
}
