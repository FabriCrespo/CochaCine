/**
 * =============================================================================
 * CONSTANTES DE LA APLICACIÓN
 * =============================================================================
 *
 * Valores fijos que NO son secretos. Si TMDB cambia de dominio, se toca
 * UNA vez aquí y todo el proyecto sigue funcionando.
 *
 * `as const` le dice a TypeScript: estos strings son literales exactos,
 * no `string` genérico. Por eso PosterSize sale de las keys de TMDB_POSTER_SIZE.
 */

export const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3'

export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

export const TMDB_POSTER_SIZE = {
  card: 'w500',
  detail: 'w780',
} as const

export const TMDB_BACKDROP_SIZE = 'w1280'
export const TMDB_PROFILE_SIZE = 'w185'
export const TMDB_PROVIDER_LOGO_SIZE = 'w92'

/** 'card' | 'detail' — se infiere de las keys del objeto de arriba. */
export type PosterSize = keyof typeof TMDB_POSTER_SIZE

/** Metadatos de TMDB (títulos, sinopsis, géneros) siempre en inglés. */
export const DEFAULT_LANGUAGE = 'en-US'

/**
 * Pósters/backdrops: inglés primero, luego sin idioma (arte sin texto).
 * Evita el afiche en español que TMDB pone por defecto en cine boliviano.
 */
export const TMDB_IMAGE_LANGUAGES = 'en,null'

/** Código ISO 3166-1 de Bolivia para /discover/movie?with_origin_country= */
export const BOLIVIA_ORIGIN_COUNTRY = 'BO'

/** Director paceño del special de la home. Filmografía: GET /person/{id}/movie_credits */
export const TMDB_PERSON_MARCOS_LOAYZA = 1372187

export const MARCOS_LOAYZA_PHOTO = '/directors/marcos-loayza.jpg'

/** Still del hero del catálogo (archivo local en /public). */
export const CATALOG_HERO_IMAGE = '/hero-catalog.jpg'

/** La Hija Cóndor — featured on the catalog hero. */
export const TMDB_MOVIE_LA_HIJA_CONDOR = 1459062

/** Averno (2018) — Marcos Loayza. */
export const TMDB_MOVIE_AVERNO = 497945

/** Utama (2022) — Alejandro Loayza Grisi. */
export const TMDB_MOVIE_UTAMA = 913820

export const AUTHOR = {
  name: 'Fabricio Crespo',
  github: 'https://github.com/FabriCrespo',
  repo: 'https://github.com/FabriCrespo/CochaCine',
  portfolio: 'https://fabricrespo.github.io/Portfolio/',
} as const

export const HTTP_TIMEOUT_MS = 10_000

/** IMDb vía lector: la página tarda más que TMDB. */
export const HTTP_IMDB_TIMEOUT_MS = 25_000
