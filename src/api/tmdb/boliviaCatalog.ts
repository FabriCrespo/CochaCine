/**
 * =============================================================================
 * CATÁLOGO DE CINE BOLIVIANO (no el dump crudo de TMDB)
 * =============================================================================
 *
 * El campo que TMDB usa en /discover (`origin_country`) NO es el país
 * productor. Si falta, TMDB lo infiere del idioma original:
 *
 *   original_language = es  →  origin_country = ES (España)
 *   original_language = en  →  origin_country = US
 *
 * Por eso clásicos bolivianos en español (Cuestión de fe, Las Malcogidas,
 * Mi Socio 2.0) “son españolas”, y Llamita (mal etiquetada en inglés)
 * “es estadounidense”. Discover with_origin_country=BO no las trae.
 *
 * La señal correcta es production_countries (y, en Wikidata, P495=Bolivia).
 * Blackthorn sí tiene BO en producción, pero es un western extranjero
 * rodado acá: varios países + idioma original que no es del catálogo.
 */

import { BOLIVIA_ORIGIN_COUNTRY, DEFAULT_LANGUAGE, TMDB_IMAGE_LANGUAGES } from '../../config/constants.ts'
import { BOLIVIA_PRODUCED_TMDB_IDS } from './boliviaProducedIds.ts'
import type { TmdbMovieListItemDto } from './tmdb.types.ts'

/**
 * Idiomas en los que se hace cine boliviano.
 * `es` cubre la mayoría. `ay` / `qu` / `gn` cubren aymara, quechua y
 * guaraní (Utama, etc.). El `|` es OR en /discover de TMDB.
 */
export const BOLIVIAN_CATALOG_LANGUAGES = ['es', 'ay', 'qu', 'gn'] as const

export const BOLIVIAN_CATALOG_LANGUAGES_QUERY =
  BOLIVIAN_CATALOG_LANGUAGES.join('|')

const BOLIVIAN_LANGUAGE_SET = new Set<string>(BOLIVIAN_CATALOG_LANGUAGES)

/**
 * Keyword TMDB “bolivia” (3228). Complementa origin_country=BO cuando
 * la ficha tiene el keyword aunque el país esté mal.
 */
export const TMDB_KEYWORD_BOLIVIA = 3228

const PRODUCED_IN_BOLIVIA_IDS = new Set<number>(BOLIVIA_PRODUCED_TMDB_IDS)

export function isBoliviaProducedId(id: number): boolean {
  return PRODUCED_IN_BOLIVIA_IDS.has(id)
}

/**
 * Red de seguridad si TMDB no aplica el keyword o el idioma.
 * 68818     Blackthorn (coproducción rodada en Bolivia)
 * 525686    Mi prima la sexóloga (2016)
 * 1305194   Mi prima la sexóloga 2
 */
const HIDDEN_FROM_SHOWCASE_IDS = new Set([68818, 525686, 1305194])

const JUNK_TITLE_PATTERN = /sexólog|sexolog/i

export function bolivianCatalogDiscoverParams(
  { includeLanguages = true }: { includeLanguages?: boolean } = {},
) {
  return {
    language: DEFAULT_LANGUAGE,
    include_image_language: TMDB_IMAGE_LANGUAGES,
    include_adult: false,
    with_origin_country: BOLIVIA_ORIGIN_COUNTRY,
    sort_by: 'popularity.desc',
    ...(includeLanguages
      ? { with_original_language: BOLIVIAN_CATALOG_LANGUAGES_QUERY }
      : {}),
  }
}

function producedInBolivia(dto: TmdbMovieListItemDto): boolean {
  if (isBoliviaProducedId(dto.id)) return true
  return hasBolivianProductionCountry(dto)
}

export function hasBolivianProductionCountry(dto: TmdbMovieListItemDto): boolean {
  return (dto.production_country_codes ?? []).includes(BOLIVIA_ORIGIN_COUNTRY)
}

export function catalogTitlesMatch(query: string, dto: TmdbMovieListItemDto): boolean {
  const needle = normalizeCatalogTitle(query)
  if (!needle) return false
  const titles = [dto.title, dto.original_title ?? '']
    .map(normalizeCatalogTitle)
    .filter(Boolean)
  if (titles.includes(needle)) return true
  if (needle.length < 10) return false
  return titles.some((title) => title.includes(needle) || needle.includes(title))
}

function normalizeCatalogTitle(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
}

/**
 * Western / cine extranjero rodado en Bolivia: BO figura en producción
 * junto a varios países europeos y el idioma original no es del catálogo.
 * Llamita (BO+ES, hablada en español, mal taggeada en inglés) no entra acá.
 */
function isForeignShootInBolivia(dto: TmdbMovieListItemDto): boolean {
  const countries = dto.production_country_codes ?? []
  if (!countries.includes(BOLIVIA_ORIGIN_COUNTRY)) return false
  if (countries.length < 3) return false
  const language = dto.original_language
  return Boolean(language && !BOLIVIAN_LANGUAGE_SET.has(language))
}

/**
 * Filtro local (cinturón y tirantes).
 * TMDB a veces ignora un query o deja adult=false en cine erótico suave.
 */
export function isBolivianCatalogMovie(dto: TmdbMovieListItemDto): boolean {
  if (dto.adult) return false
  if (HIDDEN_FROM_SHOWCASE_IDS.has(dto.id)) return false

  const titles = `${dto.title} ${dto.original_title ?? ''}`
  if (JUNK_TITLE_PATTERN.test(titles)) return false

  if (isForeignShootInBolivia(dto)) return false

  if (producedInBolivia(dto)) return true

  if (
    dto.original_language &&
    !BOLIVIAN_LANGUAGE_SET.has(dto.original_language)
  ) {
    return false
  }

  return true
}

/** Póster + sinopsis + año + al menos un género: ficha usable. */
export function isCatalogRecordComplete(dto: TmdbMovieListItemDto): boolean {
  if (producedInBolivia(dto) && dto.poster_path) return true
  return Boolean(
    dto.poster_path &&
      dto.overview?.trim() &&
      dto.release_date &&
      (dto.genre_ids?.length ?? 0) > 0,
  )
}

/** 20 páginas cubren el discover BO (~264 títulos) sin cortar la cola. */
export const MAX_BOLIVIAN_DISCOVER_PAGES = 20
