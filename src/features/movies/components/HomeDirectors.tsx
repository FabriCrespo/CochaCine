/**
 * Spotlight de directores: un retrato a la vez, letras que reaparecen.
 */

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { Link } from 'react-router'
import { SPOTLIGHT_DIRECTORS } from '../../../config/directors.ts'
import { paths } from '../../../lib/paths.ts'

const SLIDE_MS = 8000

export function HomeDirectors() {
  const sectionRef = useRef<HTMLElement>(null)
  const pointerX = useRef(0)
  const [index, setIndex] = useState(0)
  const [inView, setInView] = useState(false)
  const [paused, setPaused] = useState(false)

  const director = SPOTLIGHT_DIRECTORS[index]
  const count = SPOTLIGHT_DIRECTORS.length

  useEffect(() => {
    for (const piece of SPOTLIGHT_DIRECTORS) {
      const image = new Image()
      image.src = piece.image
    }
  }, [])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!inView || paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count)
    }, SLIDE_MS)
    return () => window.clearInterval(timer)
  }, [count, index, inView, paused])

  function goTo(next: number) {
    setIndex((next + count) % count)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    pointerX.current = event.clientX
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const delta = event.clientX - pointerX.current
    if (delta > 60) goTo(index - 1)
    if (delta < -60) goTo(index + 1)
  }

  const nameLines = [director.givenName, director.familyName].filter(Boolean)

  return (
    <section
      ref={sectionRef}
      className="bg-paper text-ink"
      aria-roledescription="carousel"
      aria-labelledby="directors-heading"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <h2 id="directors-heading" className="sr-only">
        Director Spotlight
      </h2>

      <div className="relative mx-auto grid min-h-[min(92vh,54rem)] max-w-360 items-center gap-8 px-6 py-16 lg:grid-cols-[1fr_minmax(18rem,32rem)_1fr] lg:gap-6 lg:px-12">
        <p
          key={`kicker-${director.id}`}
          className="spotlight-kicker text-center text-[11px] tracking-[0.28em] uppercase text-ink/55 lg:text-left"
        >
          {director.kicker}
        </p>

        <div
          className="spotlight-portrait mx-auto h-[min(72vh,40rem)] w-full max-w-lg cursor-grab overflow-hidden active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          <img
            key={director.id}
            src={director.image}
            alt={director.imageAlt}
            className="h-full w-full origin-center object-contain"
            style={{ objectPosition: director.imagePosition }}
            draggable={false}
          />
        </div>

        <div
          key={`copy-${director.id}`}
          className="flex flex-col items-center lg:items-end"
        >
          <h3
            className="text-center font-display text-5xl italic leading-[0.88] text-ink sm:text-6xl lg:text-right lg:text-7xl xl:text-8xl"
            aria-live="polite"
          >
            {nameLines.map((part) => (
              <span key={part} className="spotlight-name-word">
                <span>{part}</span>
              </span>
            ))}
          </h3>
          <span className="spotlight-rule mt-7 h-px w-16 origin-center bg-brand lg:w-24 lg:origin-right" />
          <Link
            to={paths.director(director.id)}
            className="spotlight-button mt-8 border border-ink px-5 py-2.5 font-sans text-[11px] tracking-[0.22em] uppercase text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            View profile
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 pb-10">
        <CarouselArrow label="Previous director" onClick={() => goTo(index - 1)}>
          <ChevronLeft />
        </CarouselArrow>
        <div className="flex items-center gap-2" role="tablist" aria-label="Directors">
          {SPOTLIGHT_DIRECTORS.map((piece, pieceIndex) => (
            <button
              key={piece.id}
              type="button"
              role="tab"
              aria-selected={pieceIndex === index}
              aria-label={piece.name}
              onClick={() => goTo(pieceIndex)}
              className={`h-px w-8 ${pieceIndex === index ? 'bg-ink' : 'bg-ink/25 hover:bg-ink/50'}`}
            />
          ))}
        </div>
        <CarouselArrow label="Next director" onClick={() => goTo(index + 1)}>
          <ChevronRight />
        </CarouselArrow>
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
      className="flex h-10 w-10 items-center justify-center text-ink/40 hover:text-ink"
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
        strokeWidth="1.6"
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
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
