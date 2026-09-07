const STORAGE_KEY = 'cochacine.watchlist'
const CHANGE_EVENT = 'cochacine:watchlist'

export type WatchlistItem = {
  id: number
  title: string
  posterUrl: string | null
  releaseYear: string | null
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function parseWatchlist(raw: string | null): WatchlistItem[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map(normalizeItem)
      .filter((item): item is WatchlistItem => item != null)
  } catch {
    return []
  }
}

function normalizeItem(value: unknown): WatchlistItem | null {
  if (typeof value === 'number' && value > 0) {
    return { id: value, title: `Title ${value}`, posterUrl: null, releaseYear: null }
  }
  if (!value || typeof value !== 'object') return null
  const row = value as Partial<WatchlistItem>
  if (typeof row.id !== 'number' || row.id <= 0) return null
  return {
    id: row.id,
    title: typeof row.title === 'string' && row.title.trim() ? row.title : `Title ${row.id}`,
    posterUrl: typeof row.posterUrl === 'string' && row.posterUrl ? row.posterUrl : null,
    releaseYear: typeof row.releaseYear === 'string' && row.releaseYear ? row.releaseYear : null,
  }
}

function writeItems(items: WatchlistItem[]) {
  if (!canUseStorage()) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function listWatchlist(): WatchlistItem[] {
  if (!canUseStorage()) return []
  return parseWatchlist(window.localStorage.getItem(STORAGE_KEY))
}

export function toggleWatchlist(item: WatchlistItem): boolean {
  const current = listWatchlist()
  const exists = current.some((entry) => entry.id === item.id)
  const next = exists
    ? current.filter((entry) => entry.id !== item.id)
    : [item, ...current.filter((entry) => entry.id !== item.id)]
  writeItems(next)
  return !exists
}

export function removeFromWatchlist(id: number) {
  writeItems(listWatchlist().filter((item) => item.id !== id))
}

export function subscribeWatchlist(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {}

  function onStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY || event.key === null) onChange()
  }

  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener('storage', onStorage)
  }
}
