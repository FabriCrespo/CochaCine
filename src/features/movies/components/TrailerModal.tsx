import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { MovieTrailer } from './MovieTrailer.tsx'

type TrailerModalProps = {
  youtubeKey: string
  title: string
  onClose: () => void
}

export function TrailerModal({ youtubeKey, title, onClose }: TrailerModalProps) {
  useEffect(() => {
    function handleKey(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = previous
    }
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/88 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Trailer for ${title}`}
        className="w-full max-w-4xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 text-sm tracking-[0.14em] uppercase text-muted hover:text-ivory"
          >
            Close
          </button>
        </div>
        <MovieTrailer youtubeKey={youtubeKey} title={title} autoPlay />
      </div>
    </div>,
    document.body,
  )
}
