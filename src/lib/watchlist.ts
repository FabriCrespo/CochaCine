const STORAGE_KEY = 'cochacine.watchlist'

function readIds(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((id): id is number => typeof id === 'number' && id > 0)
  } catch {
    return []
  }
}

function writeIds(ids: number[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

export function isOnWatchlist(id: number): boolean {
  return readIds().includes(id)
}

export function toggleWatchlist(id: number): boolean {
  const ids = readIds()
  const next = ids.includes(id)
    ? ids.filter((item) => item !== id)
    : [...ids, id]
  writeIds(next)
  return next.includes(id)
}
