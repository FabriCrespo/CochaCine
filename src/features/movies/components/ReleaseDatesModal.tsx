import { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import {
  LA_HIJA_CONDOR_TICKETS,
  type FeaturedTicketListing,
} from '../../../config/laHijaCondor.ts'
import { formatReleaseDateLong, todayIsoInLaPaz } from '../../../lib/dates.ts'

type ReleaseDatesModalProps = {
  title: string
  onClose: () => void
}

export function ReleaseDatesModal({ title, onClose }: ReleaseDatesModalProps) {
  const { upcoming, available } = useMemo(
    () => splitListings(LA_HIJA_CONDOR_TICKETS, todayIsoInLaPaz()),
    [],
  )

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

  const isEmpty = upcoming.length === 0 && available.length === 0

  return createPortal(
    <div
      className="fixed inset-0 z-80 flex items-center justify-center bg-black/88 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="release-dates-title"
        className="max-h-[80vh] w-full max-w-lg overflow-auto bg-ink px-6 py-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="release-dates-title" className="font-display text-3xl italic text-ivory">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm tracking-[0.14em] uppercase text-muted hover:text-ivory"
          >
            Close
          </button>
        </div>

        {isEmpty ? (
          <p className="font-serif text-muted">No current or upcoming theatrical dates.</p>
        ) : null}

        {upcoming.length > 0 ? (
          <section className={available.length > 0 ? 'mb-8' : ''}>
            <h3 className="text-xs tracking-[0.18em] uppercase text-brand">Upcoming dates</h3>
            <ul className="mt-4 space-y-1">
              {upcoming.map((item) => (
                <li key={`${item.country}-${item.place}-${item.date}`}>
                  <TicketRow item={item} showDate />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {available.length > 0 ? (
          <section>
            <h3 className="text-xs tracking-[0.18em] uppercase text-brand">Now available</h3>
            <ul className="mt-4 space-y-1">
              {available.map((item) => (
                <li key={`${item.country}-${item.place}`}>
                  <TicketRow item={item} showDate={false} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}

function TicketRow({
  item,
  showDate,
}: {
  item: FeaturedTicketListing
  showDate: boolean
}) {
  return (
    <a
      href={item.ticketsUrl}
      target="_blank"
      rel="noreferrer noopener"
      className="block py-2 hover:text-brand"
    >
      <span className="flex items-baseline justify-between gap-4">
        <span className="text-left font-serif text-ivory">{item.country}</span>
        <span className="text-[11px] tracking-[0.16em] uppercase text-muted">Tickets</span>
      </span>
      <span className="mt-0.5 block text-left text-sm text-muted">
        {item.place}
        {showDate && item.date ? ` · ${formatReleaseDateLong(item.date)}` : null}
      </span>
    </a>
  )
}

function splitListings(listings: FeaturedTicketListing[], today: string): {
  upcoming: FeaturedTicketListing[]
  available: FeaturedTicketListing[]
} {
  const upcoming: FeaturedTicketListing[] = []
  const available: FeaturedTicketListing[] = []

  for (const item of listings) {
    if (item.date && item.date > today) {
      upcoming.push(item)
      continue
    }
    if (item.until && item.until < today) continue
    if (item.date && item.date <= today && !item.until) {
      available.push(item)
      continue
    }
    if (!item.date) available.push(item)
  }

  return { upcoming, available }
}
