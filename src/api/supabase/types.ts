export type MovieOverride = {
  tmdb_id: number
  title_en: string | null
  overview_en: string | null
  tagline_en: string | null
  poster_url: string | null
  backdrop_url: string | null
  trailer_youtube_key: string | null
  director_name: string | null
  notes: string | null
  updated_at: string | null
}

export type MovieOverrideWrite = Omit<MovieOverride, 'updated_at'>

export const MOVIE_OVERRIDES_TABLE = 'movie_overrides'

export const MOVIE_MEDIA_BUCKET = 'movie-media'

export const MOVIE_OVERRIDE_COLUMNS =
  'tmdb_id, title_en, overview_en, tagline_en, poster_url, backdrop_url, trailer_youtube_key, director_name, notes, updated_at'
