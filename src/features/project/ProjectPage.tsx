/**
 * Caso de estudio. Route: `/project`
 * Documento para un recruiter: qué es, por qué, qué está hecho.
 */

import { type ReactNode } from 'react'
import { Link } from 'react-router'
import { AUTHOR } from '../../config/constants.ts'
import { PROJECT_STILLS } from '../../config/projectCase.ts'
import { AppShell } from '../../components/layout/AppShell.tsx'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs.tsx'
import { paths } from '../../lib/paths.ts'

export function ProjectPage() {
  return (
    <AppShell title="Case study" after={<ProjectDocument />} />
  )
}

function ProjectDocument() {
  return (
    <article className="bg-paper text-ink">
      <header className="mx-auto max-w-3xl px-6 pt-16 pb-12 sm:pt-20">
        <Breadcrumbs
          tone="paper"
          items={[
            { label: 'Home', to: paths.home },
            { label: 'Case study' },
          ]}
        />
        <p className="mt-8 text-[11px] tracking-[0.28em] uppercase text-ink/45">Case study</p>
        <h2 className="mt-4 font-display text-5xl italic leading-[1.05] sm:text-6xl lg:text-7xl">
          Cochacine
        </h2>
        <p className="mt-5 font-display text-2xl italic leading-snug text-ink/70">
          An editorial archive of Bolivian cinema — a house, not a moodboard.
        </p>
        <span className="mt-8 block h-px w-16 bg-brand" />
        <p className="mt-8 font-serif text-lg leading-8 text-ink/80">
          Built by {AUTHOR.name}. React, Vite, TypeScript. Not Next.js, not a CMS, not
          Shopify. The public house is the product; this page is the notes.
        </p>
      </header>

      <div className="mx-auto max-w-3xl space-y-16 px-6 pb-28">
        <Section kicker="01" title="What it is">
          <p>
            Cochacine is a small cinema house on the web: a curated archive of films
            produced in Bolivia, a vitrine for what is playing now, and a set of
            director rooms for the people who made the climate.
          </p>
          <p>
            It is not a streaming app, not Cine Center, not TMDB Popular with a flag
            filter. The home is a program (hero, most beloved, decades, reading,
            masters, a descent into the present). The archive is the stacks. The
            editor is the back office where copy and posters get corrected when the
            databases lie.
          </p>
        </Section>

        <Section kicker="02" title="The problem">
          <p>
            Bolivian cinema is easy to lose. On TMDB, <span className="italic">origin_country</span> is
            often copied from the original language: a film in Spanish becomes
            Spanish, a film mis-tagged in English becomes American.{' '}
            <span className="italic">Cuestión de fe</span> disappears from “Bolivia.”
            Discover with <span className="italic">BO</span> is a hole.
          </p>
          <p>
            What exists instead is festival ephemera, Letterboxd lists, and house
            sites that look like TV guides. There was no place that treated the
            catalog as an editorial object — English for an international reader,
            the right country, the right plot, a poster that is a poster and not a
            card in a grid of twelve identical radii.
          </p>
        </Section>

        <Section kicker="03" title="Stack — the real one">
          <p>
            The brief said “Next, CMS, auth, DB, animations.” This is what shipped
            instead, on purpose.
          </p>
          <dl className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
            {STACK.map((row) => (
              <div key={row.label} className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
                <dt className="text-[11px] tracking-[0.18em] uppercase text-ink/45">{row.label}</dt>
                <dd className="font-serif text-base leading-7 text-ink/80">{row.value}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section kicker="04" title="Decisions">
          <ul className="space-y-6">
            {DECISIONS.map((item) => (
              <li key={item.title}>
                <p className="font-display text-xl italic text-ink">{item.title}</p>
                <p className="mt-2 font-serif text-lg leading-8 text-ink/80">{item.body}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section kicker="05" title="Built vs placeholder">
          <div className="grid gap-10 sm:grid-cols-2">
            <div>
              <p className="text-[11px] tracking-[0.18em] uppercase text-ink/45">Shipped</p>
              <ul className="mt-4 space-y-2 font-serif text-base leading-7 text-ink/80">
                {SHIPPED.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] tracking-[0.18em] uppercase text-ink/45">Not this, or not yet</p>
              <ul className="mt-4 space-y-2 font-serif text-base leading-7 text-ink/80">
                {NOT_THIS.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        <Section kicker="06" title="The hard parts">
          <ol className="space-y-8">
            {CHALLENGES.map((item, index) => (
              <li key={item.title}>
                <p className="text-[11px] tracking-[0.18em] uppercase text-brand">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <p className="mt-2 font-display text-2xl italic text-ink">{item.title}</p>
                <p className="mt-2 font-serif text-lg leading-8 text-ink/80">{item.body}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section kicker="07" title="Stills from the house">
          <ul className="space-y-12">
            {PROJECT_STILLS.map((still) => (
              <li key={still.src}>
                <img
                  src={still.src}
                  alt={still.alt}
                  className={`w-full ${still.frame}`}
                />
                <p className="mt-3 font-serif text-sm leading-6 text-ink/55">{still.caption}</p>
              </li>
            ))}
          </ul>
        </Section>

        <nav className="border-t border-ink/10 pt-10">
          <p className="text-[11px] tracking-[0.18em] uppercase text-ink/45">Walk the house</p>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-serif text-lg">
            <li>
              <Link to={paths.home} className="text-ink underline decoration-brand/70 underline-offset-4 hover:text-brand">
                Home
              </Link>
            </li>
            <li>
              <Link to={paths.archive} className="text-ink underline decoration-brand/70 underline-offset-4 hover:text-brand">
                Archive
              </Link>
            </li>
            <li>
              <Link
                to={paths.director('jorge-sanjines')}
                className="text-ink underline decoration-brand/70 underline-offset-4 hover:text-brand"
              >
                Sanjinés
              </Link>
            </li>
            <li>
              <a
                href={AUTHOR.repo}
                target="_blank"
                rel="noreferrer noopener"
                className="text-ink underline decoration-brand/70 underline-offset-4 hover:text-brand"
              >
                Repo
              </a>
            </li>
            <li>
              <a
                href={AUTHOR.portfolio}
                target="_blank"
                rel="noreferrer noopener"
                className="text-ink underline decoration-brand/70 underline-offset-4 hover:text-brand"
              >
                Portfolio
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </article>
  )
}

function Section({
  kicker,
  title,
  children,
}: {
  kicker: string
  title: string
  children: ReactNode
}) {
  return (
    <section>
      <p className="text-[11px] tracking-[0.28em] uppercase text-ink/45">
        {kicker} · {title}
      </p>
      <h3 className="mt-2 font-display text-3xl italic text-ink">{title}</h3>
      <div className="mt-6 space-y-5 font-serif text-lg leading-8 text-ink/80">{children}</div>
    </section>
  )
}

const STACK = [
  {
    label: 'UI',
    value:
      'React 19, Vite 8, TypeScript strict, Tailwind 4, React Router 8. A SPA on Vercel (rewrite to index.html). Not Next.js: no server components, no SSR budget. The catalog is a client read of TMDB.',
  },
  {
    label: 'CMS',
    value:
      'None. Director essays live in src/data/directors.json. Readings, tickets, and the contemporary strip are typed config. A CMS for three filmmakers would be empty ceremony.',
  },
  {
    label: 'Auth',
    value:
      'Supabase Auth: email and password, session in the client, JWT on writes. An editors table plus RLS (is_editor) is the lock — anon can read overlays, only a listed user can save. No public sign-up in the app.',
  },
  {
    label: 'DB',
    value:
      'Supabase for editorial overlays: posters, English copy, trailers, plots, and titles TMDB never listed. The catalog itself is TMDB + a harvested ID list. Postgres is the red pen, not the library.',
  },
  {
    label: 'Motion',
    value:
      'CSS. Ken Burns on portraits, clipped italic names rising, a paper-to-ink wash into contemporary cinema. No Framer Motion. prefers-reduced-motion turns the show off.',
  },
  {
    label: 'Data flow',
    value:
      'UI → React Query hook → Axios in api/ → DTO mapper → domain Movie (rating, posterUrl). Components never see vote_average. Query cache persists a day in localStorage so the archive does not refetch on every poster click.',
  },
] as const

const DECISIONS = [
  {
    title: 'Why serif',
    body: 'Cormorant for names, Newsreader for essays, Source Sans for wayfinding. A cinema house prints a program; it does not ship a dashboard. The type has to feel like paper you keep, not a settings page.',
  },
  {
    title: 'Why dark — and then paper',
    body: 'The house is a room with the lights down: ivory on ink, gold only as a rule. Essays and director rooms switch to paper (#F6F5F0) so long reading does not happen in a cinema. Two climates, one building.',
  },
  {
    title: 'Why not Shopify',
    body: 'This is not a store. La Hija Cóndor has a curated list of ticket links (France, Switzerland, Mexico, the US) because that is the current presentation — not a cart, not JustWatch as a source of truth.',
  },
  {
    title: 'Why not Next.js',
    body: 'Vite is enough. There is no session-dependent HTML, no SEO farm of thousands of pages that need a server. The hard problem is the catalog, not the renderer.',
  },
] as const

const SHIPPED = [
  'Wikidata harvest (P495 = Bolivia) into TMDB IDs, because origin_country lies.',
  'Archive: search, genre, year, sort; home rails by decade.',
  'Movie detail: credits, providers, trailer, English plot (TMDB, then IMDb, then override).',
  'Editor: Supabase Auth + RLS. Correct posters and copy, add missing titles, upload art to storage.',
  'Three director profiles with filmography linked into the catalog when the title exists.',
  'Home program: hero, beloved, reading, spotlight, Averno / Utama / La Hija Cóndor.',
  'English-first images and copy. Prefetch on hover. SPA deploy on Vercel.',
] as const

const NOT_THIS = [
  'No public user accounts or comments — only listed editors sign in.',
  'LoayzaSpecial.tsx is leftover — the spotlight replaced it. Not wired.',
  'Only Ruiz, Sanjinés, Loayza as full rooms. Not a director CMS.',
  'Wikidata titles with no TMDB id stay on an unresolved list.',
  'Watchlist is local to the browser. It is not a social feature.',
] as const

const CHALLENGES = [
  {
    title: 'The country field is a lie.',
    body: 'Discover with Bolivia misses the canon. The fix is a belt: Wikidata production country, TMDB production_countries, language allowlist (es, ay, qu, gn), and a veto for foreign shoots that only used the landscape (Blackthorn). The catalog is a filter, not a dump.',
  },
  {
    title: 'The house speaks English; the records do not.',
    body: 'TMDB often files Bolivian films with a Spanish overview and a Spanish poster. The pipeline prefers English images, scrapes an IMDb plot when the text is still Spanish, and lets the editor overwrite both. Without that, the house would be a bilingual accident.',
  },
  {
    title: 'Names have to meet records.',
    body: 'Editorial filmographies say Yawar Mallku; TMDB may say Blood of the Condor. Matching folds accents and punctuation, scores English and original titles, and refuses weak year mismatches — so a director page can open a real ficha without linking the wrong film.',
  },
] as const
