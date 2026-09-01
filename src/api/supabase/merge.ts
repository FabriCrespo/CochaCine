/**
 * Overrides editoriales. Campos null/vacíos no pisan a TMDB.
 */

import type { Movie, MovieDetail, MovieHighlight } from '../../domain/movie.ts'
import type { MovieOverride } from './types.ts'

function text(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function csv(value: string | null | undefined): string[] | null {
  const raw = text(value)
  if (!raw) return null
  return raw
    .split(/[,;]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function lines(value: string | null | undefined): string[] | null {
  const raw = text(value)
  if (!raw) return null
  return raw
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function dateOnly(value: string | null | undefined): string | null {
  const raw = text(value)
  if (!raw) return null
  return raw.slice(0, 10)
}

function yearFromDate(value: string | null): string | null {
  if (!value || value.length < 4) return null
  return value.slice(0, 4)
}

export function applyMovieOverride<T extends Movie>(movie: T, override: MovieOverride | undefined): T {
  if (!override) return movie

  const title = text(override.title_en)
  const overview = text(override.overview_en)
  const posterUrl = text(override.poster_url)
  const releaseDate = dateOnly(override.release_date)

  return {
    ...movie,
    title: title ?? movie.title,
    overview: overview ?? movie.overview,
    posterUrl: posterUrl ?? movie.posterUrl,
    releaseYear: yearFromDate(releaseDate) ?? movie.releaseYear,
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
  const releaseDate = dateOnly(override.release_date)
  const certification = text(override.certification)
  const writers = csv(override.writers)
  const production = csv(override.production)
  const countries = csv(override.countries)
  const languages = csv(override.languages)
  const genres = csv(override.genres)
  const plot = text(override.plot_en)
  const highlightLines = lines(override.highlights_en)
  const runtime =
    override.runtime_minutes != null && override.runtime_minutes > 0
      ? override.runtime_minutes
      : listed.runtimeMinutes

  return {
    ...listed,
    tagline: tagline ?? listed.tagline,
    backdropUrl: backdropUrl ?? listed.backdropUrl,
    trailerYoutubeKey: trailer ?? listed.trailerYoutubeKey,
    director: directorName
      ? { name: directorName, photoUrl: listed.director?.photoUrl ?? null }
      : listed.director,
    releaseDate: releaseDate ?? listed.releaseDate,
    runtimeMinutes: runtime,
    certification: certification ?? listed.certification,
    writers: writers ?? listed.writers,
    productionCompanies: production ?? listed.productionCompanies,
    countries: countries ?? listed.countries,
    languages: languages ?? listed.languages,
    genres: genres ?? listed.genres,
    plot: plot ?? listed.plot,
    highlights: highlightLines ? toHighlights(highlightLines) : listed.highlights,
  }
}

function toHighlights(items: string[]): MovieHighlight[] {
  return items.map((item) => ({ kind: 'trivia', text: item }))
}
