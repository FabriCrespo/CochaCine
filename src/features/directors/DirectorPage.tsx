/**
 * Perfil de director.
 * Route: `/director/:directorId`
 */

import { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { AppShell } from '../../components/layout/AppShell.tsx'
import { findSpotlightDirector } from '../../config/directors.ts'
import { paths } from '../../lib/paths.ts'
import { useBolivianMovies } from '../../query/movies/useBolivianMovies.ts'
import { DirectorProfileView } from './DirectorProfileView.tsx'

export function DirectorPage() {
  const { directorId } = useParams()
  const director = findSpotlightDirector(directorId)
  const { data } = useBolivianMovies()

  useEffect(() => {
    const previous = document.title
    if (director) document.title = `${director.name} — Cochacine`
    return () => {
      document.title = previous
    }
  }, [director])

  if (!director) {
    return (
      <AppShell title="Director not found">
        <p className="font-serif text-lg text-ivory">That address is not a director.</p>
        <Link
          to={paths.home}
          className="mt-6 inline-block text-sm tracking-[0.18em] uppercase text-muted underline-offset-4 hover:text-ivory hover:underline"
        >
          Back home
        </Link>
      </AppShell>
    )
  }

  return (
    <AppShell
      title={director.name}
      after={<DirectorProfileView director={director} movies={data?.movies ?? []} />}
    />
  )
}
