/**
 * Ficha editorial de un director: retrato, vida, estilo, premios y filmografía.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import type { FilmmakerAward, FilmmakerFilm, SpotlightDirector } from '../../config/directors.ts'
import type { Movie } from '../../domain/movie.ts'
import { matchCatalogMovie, matchCatalogMovieByTitle } from '../../lib/catalog.ts'
import { formatReleaseDateLong } from '../../lib/dates.ts'
import { paths } from '../../lib/paths.ts'
import { usePrefetchMovie } from '../../query/movies/useMovie.ts'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs.tsx'

type DirectorProfileViewProps = {
  director: SpotlightDirector
  movies: Movie[]
}

export function DirectorProfileView({ director, movies }: DirectorProfileViewProps) {
  const nameLines = [director.givenName, director.familyName].filter(Boolean)
  const born = formatReleaseDateLong(director.birth_date)
  const died = formatReleaseDateLong(director.death_date ?? null)
  const years = lifespan(director)
  const films = director.complete_historical_filmography ?? director.imdb_filmography
  const imdbUrl = director.imdb?.name_id
    ? `https://www.imdb.com/name/${director.imdb.name_id}/`
    : null

  return (
    <article className="bg-paper text-ink">
      <div className="mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-360 items-center gap-10 px-6 py-16 lg:grid-cols-[1fr_minmax(18rem,32rem)_1fr] lg:px-12">
        <div className="text-center lg:text-left">
          <Breadcrumbs
            tone="paper"
            items={[
              { label: 'Home', to: paths.home },
              { label: director.name },
            ]}
          />
        </div>
        <div className="mx-auto h-[min(72vh,40rem)] w-full max-w-lg overflow-hidden">
          <img
            src={director.image}
            alt={director.imageAlt}
            className="h-full w-full object-contain"
            style={{ objectPosition: director.imagePosition }}
          />
        </div>
        <div className="text-center lg:text-right">
          <p className="text-[11px] tracking-[0.28em] uppercase text-ink/45">
            {director.occupation[0] ?? 'Director'}
          </p>
          <h2 className="mt-4 font-display text-5xl italic leading-[0.88] sm:text-6xl lg:text-7xl">
            {nameLines.map((part) => (
              <span key={part} className="block">
                {part}
              </span>
            ))}
          </h2>
          <p className="mt-5 font-display text-xl italic text-ink/65">{years}</p>
          <p className="mt-2 text-sm tracking-wide text-ink/50">{director.birth_place}</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 pb-28">
        {director.short_bio ? (
          <Reveal>
            <p className="font-display text-3xl italic leading-snug text-ink sm:text-4xl">
              {director.short_bio}
            </p>
          </Reveal>
        ) : null}

        <Reveal className={director.short_bio ? 'mt-12 space-y-6' : 'space-y-6'}>
          {director.biography.split('\n\n').map((paragraph) => (
            <p key={paragraph.slice(0, 48)} className="font-serif text-lg leading-8 text-ink/80">
              {paragraph}
            </p>
          ))}
        </Reveal>

        {director.impact ? (
          <Reveal>
            <Section kicker="On the screen" title="Impact">
              <p className="font-serif text-lg leading-8 text-ink/80">{director.impact}</p>
            </Section>
          </Reveal>
        ) : director.cinematic_style ? (
          <Reveal>
            <blockquote className="mt-12 border-l border-brand pl-6 font-display text-2xl italic leading-snug text-ink">
              {director.cinematic_style}
            </blockquote>
          </Reveal>
        ) : null}

        <Reveal>
          <Facts
            items={[
              { label: 'Born', value: born ? `${born} · ${director.birth_place}` : director.birth_place },
              died
                ? {
                    label: 'Died',
                    value: `${died}${director.death_place ? ` · ${director.death_place}` : ''}`,
                  }
                : null,
              { label: 'Active', value: director.active_years },
              { label: 'Occupation', value: director.occupation.join(' · ') },
              director.education?.length
                ? { label: 'Education', value: director.education.join(' · ') }
                : null,
            ]}
          />
        </Reveal>

        {director.organizations?.map((group) => (
          <Reveal key={group.name}>
            <Section kicker="Collective" title={group.name}>
              <p className="font-serif leading-8 text-ink/75">
                <span className="italic">{group.role}.</span> {group.description}
              </p>
            </Section>
          </Reveal>
        ))}

        <Reveal>
          <Section kicker="The work" title="Highlights">
            <ul className="space-y-3 font-serif leading-7 text-ink/75">
              {director.career_highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Section>
        </Reveal>

        {(director.themes ?? director.cinematic_themes).length > 0 ? (
          <Reveal>
            <Section kicker="Motifs" title="Themes">
              <p className="font-display text-2xl italic leading-8 text-ink/80">
                {(director.themes ?? director.cinematic_themes).join(' · ')}
              </p>
            </Section>
          </Reveal>
        ) : null}

        {director.teachers_and_influences?.length ? (
          <Reveal>
            <Section kicker="Lineage" title="Teachers and influences">
              <p className="font-serif leading-8 text-ink/75">
                {director.teachers_and_influences.join(' · ')}
              </p>
            </Section>
          </Reveal>
        ) : null}

        {director.major_awards.length > 0 ? (
          <Reveal>
            <Section kicker="Honors" title="Awards" icon="/directors/icons/awards.png">
              <ul className="space-y-4 sm:columns-2 sm:gap-x-10">
                {director.major_awards.map((award) => (
                  <li key={`${award.year}-${award.award}-${award.film ?? award.festival ?? ''}`} className="break-inside-avoid">
                    <AwardLine award={award} movies={movies} />
                  </li>
                ))}
              </ul>
            </Section>
          </Reveal>
        ) : null}

        {films.length > 0 ? (
          <Reveal>
            <Section kicker="The pictures" title="Filmography" icon="/directors/icons/filmography.png">
              <ul className="space-y-3 sm:columns-2 sm:gap-x-10">
                {films.map((film) => (
                  <li key={`${film.title}-${film.year}`} className="break-inside-avoid">
                    <FilmLine film={film} movies={movies} />
                  </li>
                ))}
              </ul>
              {director.imdb?.note ? (
                <p className="mt-6 font-serif text-sm leading-6 text-ink/45">{director.imdb.note}</p>
              ) : null}
            </Section>
          </Reveal>
        ) : null}

        {director.notable_producing_credits?.length ? (
          <Reveal>
            <Section kicker="Also" title="As producer">
              <ul className="space-y-3">
                {director.notable_producing_credits.map((film) => (
                  <li key={`${film.title}-${film.year}-${film.role}`}>
                    <FilmLine film={film} movies={movies} />
                  </li>
                ))}
              </ul>
            </Section>
          </Reveal>
        ) : null}

        {director.books_and_writings?.length ? (
          <Reveal>
            <Section kicker="On the page" title="Writings">
              <ul className="space-y-2 font-serif italic leading-7 text-ink/75">
                {director.books_and_writings.map((book) => (
                  <li key={book}>{book}</li>
                ))}
              </ul>
            </Section>
          </Reveal>
        ) : null}

        {director.other_arts?.length ? (
          <Reveal>
            <Section kicker="Beyond the frame" title="Other arts">
              <p className="font-serif leading-8 text-ink/75">{director.other_arts.join(' · ')}</p>
            </Section>
          </Reveal>
        ) : null}

        {director.cinematic_legacy || director.legacy ? (
          <Reveal>
            <Section kicker="Afterimage" title="Legacy" icon="/directors/icons/legacy.png">
              <p className="font-serif text-lg leading-8 text-ink/80">
                {director.cinematic_legacy ?? director.legacy}
              </p>
            </Section>
          </Reveal>
        ) : null}

        {imdbUrl ? (
          <p className="mt-14">
            <a
              href={imdbUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-[11px] tracking-[0.18em] uppercase text-ink/45 hover:text-ink"
            >
              IMDb →
            </a>
          </p>
        ) : null}
      </div>
    </article>
  )
}

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`profile-reveal ${visible ? 'is-in' : ''} ${className}`}>
      {children}
    </div>
  )
}

function Section({
  kicker,
  title,
  icon,
  children,
}: {
  kicker: string
  title: string
  icon?: string
  children: ReactNode
}) {
  return (
    <section className="mt-16">
      <p className="text-[11px] tracking-[0.28em] uppercase text-ink/40">{kicker}</p>
      <div className="mt-3 flex items-center gap-4">
        {icon ? (
          <img
            src={icon}
            alt=""
            className="h-20 w-auto max-w-24 shrink-0 object-contain mix-blend-screen sm:h-24"
          />
        ) : null}
        <h3 className="font-display text-3xl italic">{title}</h3>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  )
}

function Facts({
  items,
}: {
  items: Array<{ label: string; value: string } | null>
}) {
  const facts = items.filter((item): item is { label: string; value: string } => Boolean(item))
  if (facts.length === 0) return null

  return (
    <dl className="mt-14 space-y-4 border-y border-ink/10 py-8">
      {facts.map((fact) => (
        <div key={fact.label} className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-6">
          <dt className="text-[11px] tracking-[0.18em] uppercase text-ink/40">{fact.label}</dt>
          <dd className="font-serif leading-7 text-ink/80">{fact.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function AwardLine({ award, movies }: { award: FilmmakerAward; movies: Movie[] }) {
  const place = award.festival ?? award.organization
  const linked = award.film ? matchCatalogMovieByTitle(movies, award.film, award.year) : null

  return (
    <p className="font-serif leading-7 text-ink/75">
      <span className="text-ink/45">{award.year}</span>
      <span className="mx-2 text-ink/20">·</span>
      <span className="italic">{award.award}</span>
      {place ? (
        <>
          <span className="mx-2 text-ink/20">·</span>
          {place}
        </>
      ) : null}
      {award.film ? (
        <>
          <span className="mx-2 text-ink/20">·</span>
          <FilmTitle name={award.film} movie={linked} />
        </>
      ) : null}
      {award.description ? (
        <span className="mt-1 block text-sm text-ink/50">{award.description}</span>
      ) : null}
    </p>
  )
}

function FilmLine({ film, movies }: { film: FilmmakerFilm; movies: Movie[] }) {
  const english = film.english_title ?? film.original_title
  const extra = [film.type, film.role, film.co_director ? `with ${film.co_director}` : null, film.country]
    .filter(Boolean)
    .join(' · ')
  const movie = matchCatalogMovie(movies, film)

  return (
    <p className="font-serif leading-7 text-ink/80">
      <span className="text-ink/45">{String(film.year)}</span>
      <span className="mx-2 text-ink/20">·</span>
      <FilmTitle name={film.title} movie={movie} />
      {english && english !== film.title ? (
        <span className="text-ink/50"> ({english})</span>
      ) : null}
      {film.director ? <span className="text-ink/50"> — {film.director}</span> : null}
      {extra ? <span className="mt-0.5 block text-sm text-ink/45">{extra}</span> : null}
    </p>
  )
}

function FilmTitle({ name, movie }: { name: string; movie: Movie | null }) {
  const prefetch = usePrefetchMovie()
  if (!movie) return <span className="italic">{name}</span>

  return (
    <Link
      to={paths.movie(movie.id)}
      onPointerEnter={() => prefetch(movie.id)}
      onFocus={() => prefetch(movie.id)}
      className="italic text-ink underline decoration-brand/70 underline-offset-4 transition-colors hover:text-brand"
    >
      {name}
    </Link>
  )
}

function lifespan(director: SpotlightDirector): string {
  const birth = director.birth_date.slice(0, 4)
  if (director.death_date) return `${birth}–${director.death_date.slice(0, 4)}`
  return `${birth}–`
}
