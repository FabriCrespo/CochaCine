import { Link } from 'react-router'
import { AUTHOR } from '../../config/constants.ts'
import { paths } from '../../lib/paths.ts'

const LINKS = [
  { label: 'Case study', href: paths.project, internal: true },
  { label: 'GitHub', href: AUTHOR.github, internal: false },
  { label: 'Repo', href: AUTHOR.repo, internal: false },
  { label: 'Portfolio', href: AUTHOR.portfolio, internal: false },
] as const

export function SiteFooter() {
  return (
    <footer className="border-t border-ivory/8 bg-ink">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 py-7 sm:flex-row sm:justify-between sm:gap-6">
        <p className="text-center text-[11px] tracking-[0.18em] uppercase text-muted sm:text-left">
          Project by <span className="text-ivory/80">{AUTHOR.name}</span>
          <span className="mx-2 text-ivory/20">—</span>
          React / Vite / TypeScript
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-5" aria-label="Author">
          {LINKS.map((link) =>
            link.internal ? (
              <Link
                key={link.href}
                to={link.href}
                className="text-[11px] tracking-[0.18em] uppercase text-muted hover:text-ivory"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                className="text-[11px] tracking-[0.18em] uppercase text-muted hover:text-ivory"
              >
                {link.label}
              </a>
            ),
          )}
        </nav>
      </div>
    </footer>
  )
}
