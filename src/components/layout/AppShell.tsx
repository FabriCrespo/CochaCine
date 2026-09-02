/**
 * =============================================================================
 * AppShell — barra superior editorial
 * =============================================================================
 *
 * Logo a la izquierda. `toolbar` (buscador/filtros) al lado.
 */

import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { paths } from '../../lib/paths.ts'
import { SiteFooter } from './SiteFooter.tsx'

type AppShellProps = {
  title: string
  toolbar?: ReactNode
  hero?: ReactNode
  after?: ReactNode
  wide?: boolean
  children?: ReactNode
}

export function AppShell({ title, toolbar, hero, after, wide = false, children }: AppShellProps) {
  const width = wide ? 'max-w-7xl' : 'max-w-6xl'

  return (
    <div className="min-h-screen bg-ink font-sans text-ivory">
      <header className="sticky top-0 z-50 border-b border-ivory/8 bg-ink/90 backdrop-blur-sm">
        <div className={`mx-auto flex ${width} flex-wrap items-center gap-4 px-5 py-4`}>
          <Link to={paths.home} className="shrink-0">
            <img
              src="/logo.png?v=2"
              alt="Cochacine"
              className="h-11 w-auto sm:h-12"
            />
          </Link>
          <h1 className="sr-only">{title}</h1>
          {toolbar ? <div className="min-w-0 flex-1">{toolbar}</div> : <div className="min-w-0 flex-1" />}
          <Link
            to={paths.catalog()}
            className="shrink-0 text-[10px] tracking-[0.22em] uppercase text-muted hover:text-ivory"
          >
            Archive
          </Link>
          <Link
            to={paths.project}
            className="shrink-0 text-[10px] tracking-[0.22em] uppercase text-muted hover:text-ivory"
          >
            Project
          </Link>
          <Link
            to={paths.admin}
            className="shrink-0 text-[10px] tracking-[0.22em] uppercase text-muted hover:text-ivory"
          >
            Editor
          </Link>
        </div>
      </header>
      {hero}
      {children != null ? (
        <main
          className={`mx-auto ${width} px-5 ${
            hero ? 'pt-8 pb-20' : wide ? 'py-10 pb-24' : 'py-8 pb-20'
          }`}
        >
          {children}
        </main>
      ) : null}
      {after}
      <SiteFooter />
    </div>
  )
}
