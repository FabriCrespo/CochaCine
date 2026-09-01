import { AppError } from '../http/errors.ts'
import { requireWriteClient } from './adminClient.ts'
import { getSupabase } from './client.ts'

export const CATALOG_MANUAL_TABLE = 'catalog_manual'

export type CatalogManualRow = {
  tmdb_id: number
  imdb_id: string | null
  created_at: string | null
}

export async function fetchManualCatalogIds(): Promise<number[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data, error } = await supabase
    .from(CATALOG_MANUAL_TABLE)
    .select('tmdb_id')
    .order('created_at', { ascending: false })

  if (error) {
    console.warn('[Supabase] catalog_manual', error.message)
    return []
  }

  return (data ?? [])
    .map((row) => row.tmdb_id)
    .filter((id): id is number => typeof id === 'number' && id > 0)
}

export async function insertManualCatalogMovie(
  tmdbId: number,
  imdbId: string | null,
): Promise<void> {
  const supabase = requireWriteClient()
  const { error } = await supabase.from(CATALOG_MANUAL_TABLE).upsert(
    { tmdb_id: tmdbId, imdb_id: imdbId },
    { onConflict: 'tmdb_id' },
  )

  if (error) {
    const hint = isMissingTableError(error.message)
      ? ' Run supabase/migrations/20260901_catalog_manual.sql in the Supabase SQL editor.'
      : ''
    throw new AppError(`${error.message}${hint}`, 'HTTP', null)
  }
}

function isMissingTableError(message: string): boolean {
  return /schema cache|does not exist|could not find the table/i.test(message)
}
