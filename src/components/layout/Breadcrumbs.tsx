import { Link } from 'react-router'

export type Crumb = {
  label: string
  to?: string
}

type BreadcrumbsProps = {
  items: Crumb[]
  tone?: 'dark' | 'paper'
}

export function Breadcrumbs({ items, tone = 'dark' }: BreadcrumbsProps) {
  const link = tone === 'paper' ? 'text-ink/40 hover:text-ink' : 'text-muted hover:text-ivory'
  const current = tone === 'paper' ? 'text-ink/70' : 'text-ivory/75'
  const slash = tone === 'paper' ? 'text-ink/20' : 'text-ivory/20'

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-[11px] tracking-[0.16em] uppercase">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 ? (
              <span className={slash} aria-hidden>
                /
              </span>
            ) : null}
            {item.to ? (
              <Link to={item.to} className={link}>
                {item.label}
              </Link>
            ) : (
              <span className={current}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
