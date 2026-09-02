/**
 * Lecturas en inglés, debajo del catálogo de la home.
 * Stills tomados de cada artículo.
 */

import { FEATURED_READINGS, type FeaturedReading } from '../../../config/readings.ts'

export function HomeReading() {
  return (
    <section className="mt-20 border-t border-ivory/10 pt-14" aria-labelledby="reading-heading">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand">The library</p>
          <h2 id="reading-heading" className="mt-2 font-display text-4xl italic text-ivory sm:text-5xl">
            Essential reading
          </h2>
        </div>
        <p className="max-w-sm font-display text-lg italic leading-7 text-ivory/70">
          Essays that open the door — history, revolt, and a film that travelled the world.
        </p>
      </div>

      <ul className="grid gap-12 md:grid-cols-3 md:gap-8">
        {FEATURED_READINGS.map((piece) => (
          <li key={piece.id}>
            <ReadingCard piece={piece} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function ReadingCard({ piece }: { piece: FeaturedReading }) {
  return (
    <a
      href={piece.href}
      target="_blank"
      rel="noreferrer noopener"
      className="group block outline-none focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-brand"
    >
      <div className="relative overflow-hidden bg-ink-soft">
        <img
          src={piece.image}
          alt={piece.imageAlt}
          className="aspect-3/2 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          style={{ objectPosition: piece.imagePosition }}
        />
        <div className="pointer-events-none absolute inset-0 bg-ink/15 transition-colors duration-500 group-hover:bg-ink/0" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-ink/50 to-transparent" />
      </div>
      <p className="mt-4 text-[11px] tracking-[0.2em] uppercase text-muted">
        {piece.kicker} · {piece.year}
      </p>
      <h3 className="mt-2 font-display text-2xl italic leading-snug text-ivory transition-colors group-hover:text-brand">
        {piece.title}
      </h3>
      <p className="mt-3 font-serif text-sm leading-6 text-ivory/65">{piece.dek}</p>
      <span className="mt-4 inline-block text-[11px] tracking-[0.18em] uppercase text-brand">
        Read →
      </span>
    </a>
  )
}
