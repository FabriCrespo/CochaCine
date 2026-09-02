import { useRef, type ReactNode } from 'react'

type HorizontalCarouselProps = {
  title: string
  children: ReactNode
}

export function HorizontalCarousel({ title, children }: HorizontalCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  function scrollByPage(direction: -1 | 1) {
    const node = scrollerRef.current
    if (!node) return
    const amount = Math.min(node.clientWidth * 0.75, 520)
    node.scrollBy({ left: direction * amount, behavior: 'smooth' })
  }

  return (
    <section>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 className="font-display text-3xl italic text-ivory sm:text-4xl">{title}</h3>
        <div className="flex items-center gap-1">
          <CarouselArrow label="Previous" onClick={() => scrollByPage(-1)}>
            <ChevronLeft />
          </CarouselArrow>
          <CarouselArrow label="Next" onClick={() => scrollByPage(1)}>
            <ChevronRight />
          </CarouselArrow>
        </div>
      </div>
      <div
        ref={scrollerRef}
        className="flex gap-6 overflow-x-auto scroll-smooth pb-1"
      >
        {children}
      </div>
    </section>
  )
}

function CarouselArrow({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center text-muted outline-none ring-1 ring-transparent transition-[color,box-shadow] duration-300 hover:text-ivory hover:ring-ivory/35 focus-visible:text-ivory focus-visible:ring-brand"
    >
      {children}
    </button>
  )
}

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M15 5 8 12l7 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="m9 5 7 7-7 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
