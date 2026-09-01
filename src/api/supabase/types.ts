export type MovieOverride = {
  tmdb_id: number
  title_en: string | null
  overview_en: string | null
  tagline_en: string | null
  poster_url: string | null
  backdrop_url: string | null
  trailer_youtube_key: string | null
  director_name: string | null
  release_date: string | null
  runtime_minutes: number | null
  certification: string | null
  writers: string | null
  production: string | null
  countries: string | null
  languages: string | null
  genres: string | null
  highlights_en: string | null
  plot_en: string | null
  notes: string | null
  updated_at: string | null
}

export type MovieOverrideWrite = Omit<MovieOverride, 'updated_at'>

export const MOVIE_OVERRIDES_TABLE = 'movie_overrides'

export const MOVIE_MEDIA_BUCKET = 'movie-media'

export const MOVIE_OVERRIDE_COLUMNS = [
  'tmdb_id',
  'title_en',
  'overview_en',
  'tagline_en',
  'poster_url',
  'backdrop_url',
  'trailer_youtube_key',
  'director_name',
  'release_date',
  'runtime_minutes',
  'certification',
  'writers',
  'production',
  'countries',
  'languages',
  'genres',
  'highlights_en',
  'plot_en',
  'notes',
  'updated_at',
].join(', ')

/** Columns that exist even if the extra-details migration was not run yet. */
export const MOVIE_OVERRIDE_LEGACY_COLUMNS = [
  'tmdb_id',
  'title_en',
  'overview_en',
  'tagline_en',
  'poster_url',
  'backdrop_url',
  'trailer_youtube_key',
  'director_name',
  'notes',
  'updated_at',
].join(', ')

export function normalizeMovieOverride(row: Partial<MovieOverride> & { tmdb_id: number }): MovieOverride {
  return {
    tmdb_id: row.tmdb_id,
    title_en: row.title_en ?? null,
    overview_en: row.overview_en ?? null,
    tagline_en: row.tagline_en ?? null,
    poster_url: row.poster_url ?? null,
    backdrop_url: row.backdrop_url ?? null,
    trailer_youtube_key: row.trailer_youtube_key ?? null,
    director_name: row.director_name ?? null,
    release_date: row.release_date ?? null,
    runtime_minutes: row.runtime_minutes ?? null,
    certification: row.certification ?? null,
    writers: row.writers ?? null,
    production: row.production ?? null,
    countries: row.countries ?? null,
    languages: row.languages ?? null,
    genres: row.genres ?? null,
    highlights_en: row.highlights_en ?? null,
    plot_en: row.plot_en ?? null,
    notes: row.notes ?? null,
    updated_at: row.updated_at ?? null,
  }
}

export type MovieOverrideLegacyWrite = Pick<
  MovieOverrideWrite,
  | 'tmdb_id'
  | 'title_en'
  | 'overview_en'
  | 'tagline_en'
  | 'poster_url'
  | 'backdrop_url'
  | 'trailer_youtube_key'
  | 'director_name'
  | 'notes'
>

export function toLegacyOverrideWrite(payload: MovieOverrideWrite): MovieOverrideLegacyWrite {
  return {
    tmdb_id: payload.tmdb_id,
    title_en: payload.title_en,
    overview_en: payload.overview_en,
    tagline_en: payload.tagline_en,
    poster_url: payload.poster_url,
    backdrop_url: payload.backdrop_url,
    trailer_youtube_key: payload.trailer_youtube_key,
    director_name: payload.director_name,
    notes: payload.notes,
  }
}
