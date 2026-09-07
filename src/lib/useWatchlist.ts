import { useEffect, useState } from 'react'
import { listWatchlist, subscribeWatchlist, type WatchlistItem } from './watchlist.ts'

export function useWatchlist(): WatchlistItem[] {
  const [items, setItems] = useState<WatchlistItem[]>(() => listWatchlist())

  useEffect(() => subscribeWatchlist(() => setItems(listWatchlist())), [])

  return items
}
