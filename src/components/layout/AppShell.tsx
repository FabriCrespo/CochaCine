/**
 * =============================================================================
 * AppShell — barra superior compacta (estilo Letterboxd)
 * =============================================================================
 *
 * Logo a la izquierda. `toolbar` (buscador/filtros) al lado.
 * Sin filete de margen alrededor de la ventana.
 */

import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { paths } from '../../lib/paths.ts'

type AppShellProps = {
  title: string
  toolbar?: ReactNode
  wide?: boolean
  children: ReactNode
}

export function AppShell({ title, toolbar, wide = false, children }: AppShellProps) {
  const width = wide ? 'max-w-7xl' : 'max-w-6xl'

  return (
    <div className="min-h-screen bg-ink text-brand">
      <header className="sticky top-0 z-50 border-b border-brand/20 bg-ink/95 backdrop-blur-sm">
        <div className={`mx-auto flex ${width} flex-wrap items-center gap-3 px-4 py-2.5`}>
          <Link to={paths.catalog()} className="shrink-0">
            <img
              src="/logo.png?v=2"
              alt="Cochacine"
              className="h-8 w-auto sm:h-9"
            />
          </Link>
          <h1 className="sr-only">{title}</h1>
          {toolbar ? <div className="min-w-0 flex-1">{toolbar}</div> : <div className="min-w-0 flex-1" />}
          <Link
            to={paths.admin}
            className="shrink-0 text-[10px] tracking-[0.22em] uppercase text-brand/45 hover:text-brand"
          >
            Editor
          </Link>
        </div>
      </header>
      <main className={`mx-auto ${width} px-4 ${wide ? 'py-8 pb-20' : 'py-6 pb-16'}`}>{children}</main>
    </div>
  )
}
