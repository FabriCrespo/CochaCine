/**
 * =============================================================================
 * DTOs DE TMDB (la forma CRUDA del JSON)
 * =============================================================================
 *
 * DTO = Data Transfer Object. Es el contrato de la API externa.
 * Los nombres coinciden 1:1 con el JSON de TMDB (snake_case).
 *
 * Estos tipos NUNCA salen de la carpeta api/tmdb.
 * Fuera de aquí usamos el dominio (src/domain/movie.ts).
 *
 * Cómo agregar el DTO de un endpoint nuevo (GET /movie/{id}):
 *   export type TmdbMovieDetailDto = TmdbMovieListItemDto & {
 *     runtime: number | null
 *     genres: Array<{ id: number; name: string }>
 *   }
 *
 * Campos que no usamos (adult, backdrop_path, etc.) se pueden omitir.
 * TypeScript permite que el JSON tenga MÁS propiedades de las que tipamos.
 */

export type TmdbMovieListItemDto = {
  id: number
  title: string
  original_title?: string
  overview: string
  vote_average: number
  vote_count?: number
  popularity?: number
  poster_path: string | null
  release_date: string
  adult?: boolean
  original_language?: string
  origin_country?: string[]
  /** ISO de production_countries cuando el ítem viene de GET /movie/{id}. */
  production_country_codes?: string[]
  genre_ids?: number[]
}

export type TmdbFindDto = {
  movie_results?: TmdbMovieListItemDto[]
}

export type TmdbPopularMoviesDto = {
  page: number
  results: TmdbMovieListItemDto[]
  total_pages: number
  total_results: number
}

export type TmdbCrewMovieCreditDto = TmdbMovieListItemDto & {
  job?: string
  department?: string
}

export type TmdbPersonMovieCreditsDto = {
  id: number
  crew?: TmdbCrewMovieCreditDto[]
  cast?: TmdbMovieListItemDto[]
}

/** Cuerpo de error que TMDB manda cuando algo sale mal. */
export type TmdbErrorDto = {
  status_code?: number
  status_message?: string
  success?: boolean
}

export type TmdbCastDto = {
  id: number
  name: string
  character: string
  profile_path: string | null
  order?: number
}

export type TmdbCrewDto = {
  id?: number
  name: string
  job: string
  profile_path?: string | null
}

export type TmdbCreditsDto = {
  cast?: TmdbCastDto[]
  crew?: TmdbCrewDto[]
}

export type TmdbVideoDto = {
  key: string
  name: string
  site: string
  type: string
  official?: boolean
  iso_639_1?: string
}

export type TmdbImageFileDto = {
  file_path: string
  iso_639_1?: string | null
  vote_average?: number
}

export type TmdbMovieImagesDto = {
  posters?: TmdbImageFileDto[]
  backdrops?: TmdbImageFileDto[]
}

export type TmdbProviderDto = {
  provider_id: number
  provider_name: string
  logo_path: string | null
}

export type TmdbWatchCountryDto = {
  link?: string
  flatrate?: TmdbProviderDto[]
  rent?: TmdbProviderDto[]
  buy?: TmdbProviderDto[]
  ads?: TmdbProviderDto[]
  free?: TmdbProviderDto[]
}

export type TmdbWatchProvidersDto = {
  results?: Record<string, TmdbWatchCountryDto>
}

/**
 * GET /movie/{id}?append_to_response=credits,videos,watch/providers
 * El slash en `watch/providers` es el nombre real de la key de TMDB.
 */
export type TmdbKeywordDto = {
  id: number
  name: string
}

export type TmdbMovieKeywordsDto = {
  keywords?: TmdbKeywordDto[]
  results?: TmdbKeywordDto[]
}

export type TmdbReleaseDateItemDto = {
  certification?: string
  release_date?: string
  type?: number
}

export type TmdbReleaseDatesDto = {
  results?: Array<{
    iso_3166_1: string
    release_dates?: TmdbReleaseDateItemDto[]
  }>
}

export type TmdbMovieDetailDto = TmdbMovieListItemDto & {
  runtime: number | null
  tagline?: string | null
  backdrop_path: string | null
  vote_count?: number
  genres?: Array<{ id: number; name: string }>
  spoken_languages?: Array<{
    iso_639_1?: string
    name?: string
    english_name?: string
  }>
  production_countries?: Array<{
    iso_3166_1?: string
    name?: string
  }>
  production_companies?: Array<{
    id?: number
    name?: string
  }>
  credits?: TmdbCreditsDto
  videos?: { results?: TmdbVideoDto[] }
  images?: TmdbMovieImagesDto
  translations?: TmdbMovieTranslationsDto
  keywords?: TmdbMovieKeywordsDto
  release_dates?: TmdbReleaseDatesDto
  imdb_id?: string | null
  external_ids?: { imdb_id?: string | null }
  'watch/providers'?: TmdbWatchProvidersDto
  watch_providers?: TmdbWatchProvidersDto
}

export type TmdbMovieTranslationsDto = {
  translations?: TmdbTranslationDto[]
}

export type TmdbTranslationDto = {
  iso_639_1?: string
  iso_3166_1?: string
  data?: {
    title?: string
    overview?: string
    tagline?: string
  }
}
