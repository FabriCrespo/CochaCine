import { HOME_POPULAR_LIMIT } from '../../lib/catalog.ts'
import { AppError } from '../http/errors.ts'
import { requireWriteClient, writeDeniedMessage } from './adminClient.ts'
import { getSupabase } from './client.ts'

export const CATALOG_HIDDEN_TABLE = 'catalog_hidden'
export const CATALOG_BELOVED_TABLE = 'catalog_beloved'

export type CatalogHouse = {
  hiddenIds: number[]
  belovedIds: number[]
}

export async function fetchCatalogHouse(): Promise<CatalogHouse> {
  const supabase = getSupabase()
  if (!supabase) return { hiddenIds: [], belovedIds: [] }

  const [hidden, beloved] = await Promise.all([
    supabase.from(CATALOG_HIDDEN_TABLE).select('tmdb_id'),
    supabase.from(CATALOG_BELOVED_TABLE).select('tmdb_id, sort_order').order('sort_order', {
      ascending: true,
    }),
  ])

  if (hidden.error) {
    warnMissing('catalog_hidden', hidden.error.message)
    if (!isMissingTableError(hidden.error.message)) {
      return { hiddenIds: [], belovedIds: [] }
    }
  }
  if (beloved.error) {
    warnMissing('catalog_beloved', beloved.error.message)
  }

  return {
    hiddenIds: idsFrom(hidden.data),
    belovedIds: idsFrom(beloved.data),
  }
}

export async function fetchHiddenCatalogIds(): Promise<number[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data, error } = await supabase.from(CATALOG_HIDDEN_TABLE).select('tmdb_id')
  if (error) {
    warnMissing('catalog_hidden', error.message)
    return []
  }
  return idsFrom(data)
}

export async function hideCatalogMovie(tmdbId: number): Promise<CatalogHouse> {
  const supabase = await requireWriteClient()
  const { error } = await supabase.from(CATALOG_HIDDEN_TABLE).upsert(
    { tmdb_id: tmdbId },
    { onConflict: 'tmdb_id' },
  )
  if (error) throw houseWriteError(error.message)

  await supabase.from(CATALOG_BELOVED_TABLE).delete().eq('tmdb_id', tmdbId)
  return fetchCatalogHouse()
}

export async function unhideCatalogMovie(tmdbId: number): Promise<CatalogHouse> {
  const supabase = await requireWriteClient()
  const { error } = await supabase.from(CATALOG_HIDDEN_TABLE).delete().eq('tmdb_id', tmdbId)
  if (error) throw houseWriteError(error.message)
  return fetchCatalogHouse()
}

export async function pinCatalogBeloved(tmdbId: number): Promise<CatalogHouse> {
  const supabase = await requireWriteClient()
  const current = await fetchCatalogHouse()
  if (current.belovedIds.includes(tmdbId)) return current
  if (current.belovedIds.length >= HOME_POPULAR_LIMIT) {
    throw new AppError(
      `Most beloved holds ${HOME_POPULAR_LIMIT} titles. Unpin one first.`,
      'HTTP',
      null,
    )
  }

  const { error: showError } = await supabase
    .from(CATALOG_HIDDEN_TABLE)
    .delete()
    .eq('tmdb_id', tmdbId)
  if (showError) throw houseWriteError(showError.message)

  const { error } = await supabase.from(CATALOG_BELOVED_TABLE).upsert(
    { tmdb_id: tmdbId, sort_order: current.belovedIds.length },
    { onConflict: 'tmdb_id' },
  )
  if (error) throw houseWriteError(error.message)
  return fetchCatalogHouse()
}

export async function unpinCatalogBeloved(tmdbId: number): Promise<CatalogHouse> {
  const supabase = await requireWriteClient()
  const { error } = await supabase.from(CATALOG_BELOVED_TABLE).delete().eq('tmdb_id', tmdbId)
  if (error) throw houseWriteError(error.message)
  return compactBelovedOrder()
}

export async function moveCatalogBeloved(tmdbId: number, direction: -1 | 1): Promise<CatalogHouse> {
  const current = await fetchCatalogHouse()
  const index = current.belovedIds.indexOf(tmdbId)
  const next = index + direction
  if (index < 0 || next < 0 || next >= current.belovedIds.length) return current

  const ids = [...current.belovedIds]
  const [item] = ids.splice(index, 1)
  ids.splice(next, 0, item)
  return writeBelovedOrder(ids)
}

async function compactBelovedOrder(): Promise<CatalogHouse> {
  const current = await fetchCatalogHouse()
  return writeBelovedOrder(current.belovedIds)
}

async function writeBelovedOrder(ids: number[]): Promise<CatalogHouse> {
  const supabase = await requireWriteClient()
  if (ids.length === 0) return fetchCatalogHouse()

  const rows = ids.map((tmdbId, sort_order) => ({ tmdb_id: tmdbId, sort_order }))
  const { error } = await supabase.from(CATALOG_BELOVED_TABLE).upsert(rows, {
    onConflict: 'tmdb_id',
  })
  if (error) throw houseWriteError(error.message)
  return fetchCatalogHouse()
}

function idsFrom(rows: { tmdb_id: number }[] | null): number[] {
  return (rows ?? [])
    .map((row) => row.tmdb_id)
    .filter((id): id is number => typeof id === 'number' && id > 0)
}

function houseWriteError(message: string): AppError {
  const hint = isMissingTableError(message)
    ? ' Run supabase/migrations/20260904_catalog_house.sql in the Supabase SQL editor.'
    : ''
  return new AppError(`${writeDeniedMessage(message)}${hint}`, 'HTTP', null)
}

function isMissingTableError(message: string): boolean {
  return /schema cache|does not exist|could not find the table/i.test(message)
}

function warnMissing(table: string, message: string): void {
  if (isMissingTableError(message)) {
    console.warn(
      `[Supabase] ${table} missing. Run supabase/migrations/20260904_catalog_house.sql`,
    )
    return
  }
  console.warn(`[Supabase] ${table}`, message)
}
