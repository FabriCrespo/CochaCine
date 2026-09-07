import { useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { paths } from '../../lib/paths.ts'
import { useWatchlist } from '../../lib/useWatchlist.ts'
import { removeFromWatchlist } from '../../lib/watchlist.ts'
import { usePrefetchMovie } from '../../query/movies/useMovie.ts'

export function WatchlistMenu() {
  const items = useWatchlist()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [menuPath, setMenuPath] = useState(location.pathname)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const prefetchMovie = usePrefetchMovie()

  if (location.pathname !== menuPath) {
    setMenuPath(location.pathname)
    setOpen(false)
  }

  if (open && items.length === 0) {
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return

    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('pointerdown', onPointer)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (items.length === 0) return null

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
        className="text-[10px] tracking-[0.22em] uppercase text-muted hover:text-ivory"
      >
        List
        <span className="ml-1.5 text-brand">{items.length}</span>
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-50 mt-3 w-[min(18.5rem,calc(100vw-2.5rem))] border border-ivory/12 bg-ink py-2 shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
        >
          <p className="px-3 pb-2 text-[10px] tracking-[0.22em] uppercase text-ivory/35">
            Want to watch
          </p>
          <ul className="max-h-[min(24rem,70vh)] overflow-y-auto">
            {items.map((item) => (
              <li key={item.id} className="flex items-stretch gap-1 pr-1">
                <Link
                  role="menuitem"
                  to={paths.movie(item.id)}
                  onMouseEnter={() => prefetchMovie(item.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2 hover:bg-ivory/6"
                >
                  {item.posterUrl ? (
                    <img
                      src={item.posterUrl}
                      alt=""
                      className="h-12 w-8 shrink-0 object-cover"
                    />
                  ) : (
                    <span className="flex h-12 w-8 shrink-0 items-center justify-center bg-ink-soft text-[8px] tracking-wide text-muted">
                      —
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="line-clamp-2 font-serif text-sm leading-snug text-ivory">
                      {item.title}
                    </span>
                    {item.releaseYear ? (
                      <span className="mt-0.5 block text-[11px] text-muted">{item.releaseYear}</span>
                    ) : null}
                  </span>
                </Link>
                <button
                  type="button"
                  aria-label={`Remove ${item.title}`}
                  onClick={() => removeFromWatchlist(item.id)}
                  className="shrink-0 px-2 text-[10px] tracking-[0.16em] uppercase text-muted hover:text-brand"
                >
                  Drop
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
