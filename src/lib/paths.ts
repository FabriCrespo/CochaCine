/**
 * URLs de la app. Un solo lugar para no hardcodear `/pelicula/123`
 * en cada Link.
 */

import { catalogLocation } from './catalogSearch.ts'

export const paths = {
  home: '/',
  archive: '/archivo',
  catalog: () => catalogLocation(),
  movie: (id: number) => `/pelicula/${id}`,
  director: (id: string) => `/director/${id}`,
  admin: '/admin',
  adminMovie: (id: number) => `/admin/${id}`,
} as const

export function parseMovieIdParam(value: string | undefined): number | null {
  if (!value || !/^\d+$/.test(value)) return null
  const id = Number(value)
  return id > 0 ? id : null
}
