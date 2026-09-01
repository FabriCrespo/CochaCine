/**
 * Overrides editoriales. Campos null/vacíos no pisan a TMDB.
 */

import type { Movie, MovieDetail } from '../../domain/movie.ts'
import type { MovieOverride } from './types.ts'

function text(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export function applyMovieOverride<T extends Movie>(movie: T, override: MovieOverride | undefined): T {
  if (!override) return movie

  const title = text(override.title_en)
  const overview = text(override.overview_en)
  const posterUrl = text(override.poster_url)

  return {
    ...movie,
    title: title ?? movie.title,
    overview: overview ?? movie.overview,
    posterUrl: posterUrl ?? movie.posterUrl,
  }
}

export function applyMovieDetailOverride(
  movie: MovieDetail,
  override: MovieOverride | undefined,
): MovieDetail {
  if (!override) return movie

  const listed = applyMovieOverride(movie, override)
  const tagline = text(override.tagline_en)
  const backdropUrl = text(override.backdrop_url)
  const trailer = text(override.trailer_youtube_key)
  const directorName = text(override.director_name)

  return {
    ...listed,
    tagline: tagline ?? listed.tagline,
    backdropUrl: backdropUrl ?? listed.backdropUrl,
    trailerYoutubeKey: trailer ?? listed.trailerYoutubeKey,
    director: directorName
      ? { name: directorName, photoUrl: listed.director?.photoUrl ?? null }
      : listed.director,
  }
}
