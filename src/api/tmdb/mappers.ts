/**
 * =============================================================================
 * MAPPERS (DTO de TMDB → modelo de la app)
 * =============================================================================
 *
 * Traducen el JSON de TMDB al dominio (Movie, MovieDetail, PopularMoviesPage).
 * TypeScript garantiza el contrato. La UI no ve snake_case.
 */

import { BOLIVIA_ORIGIN_COUNTRY } from '../../config/constants.ts'
import type {
  Movie,
  MovieCastMember,
  MovieDetail,
  MovieHighlight,
  MoviePerson,
  MovieWatchOptions,
  PopularMoviesPage,
  WatchProvider,
} from '../../domain/movie.ts'
import { backdropUrl, pickEnglishImagePath, posterUrl, profileUrl, providerLogoUrl } from './images.ts'
import { englishOrEmpty, pickEnglishTranslation } from './englishText.ts'
import type {
  TmdbMovieDetailDto,
  TmdbMovieListItemDto,
  TmdbPopularMoviesDto,
  TmdbProviderDto,
  TmdbVideoDto,
  TmdbWatchCountryDto,
} from './tmdb.types.ts'

const CAST_LIMIT = 12
const WRITER_JOBS = new Set(['Writer', 'Screenplay', 'Story', 'Teleplay'])
const TRUE_STORY_KEYWORD = /true story|real (life|events)|based on.*(true|real)/i
const CERT_REGIONS = ['BO', 'US', 'ES', 'MX', 'AR', 'PE', 'CL']

export function mapMovie(dto: TmdbMovieListItemDto): Movie {
  return {
    id: dto.id,
    title: dto.title,
    originalTitle: dto.original_title?.trim() || dto.title,
    overview: englishOrEmpty(dto.overview),
    rating: dto.vote_average ?? 0,
    popularity: dto.popularity ?? 0,
    voteCount: dto.vote_count ?? 0,
    posterUrl: posterUrl(dto.poster_path),
    releaseYear: dto.release_date ? dto.release_date.slice(0, 4) : null,
    genreIds: dto.genre_ids ?? [],
  }
}

export function mapMovieListItemFromDetail(dto: TmdbMovieDetailDto): TmdbMovieListItemDto {
  return {
    id: dto.id,
    title: dto.title,
    original_title: dto.original_title,
    overview: englishOrEmpty(
      pickEnglishTranslation(dto.translations?.translations, 'overview') ||
        dto.overview,
    ),
    vote_average: dto.vote_average,
    vote_count: dto.vote_count,
    popularity: dto.popularity,
    poster_path: pickEnglishImagePath(dto.images?.posters, dto.poster_path),
    release_date: dto.release_date,
    adult: dto.adult,
    original_language: dto.original_language,
    origin_country: dto.origin_country,
    production_country_codes: (dto.production_countries ?? [])
      .map((country) => country.iso_3166_1)
      .filter((code): code is string => Boolean(code)),
    genre_ids: (dto.genres ?? []).map((genre) => genre.id),
  }
}

export function mapPopularMoviesPage(dto: TmdbPopularMoviesDto): PopularMoviesPage {
  return {
    page: dto.page,
    totalPages: dto.total_pages,
    totalResults: dto.total_results,
    movies: (dto.results ?? []).map(mapMovie),
  }
}

export function mapMovieDetail(dto: TmdbMovieDetailDto): MovieDetail {
  const translations = dto.translations?.translations
  const overview =
    pickEnglishTranslation(translations, 'overview') || englishOrEmpty(dto.overview)
  const tagline =
    pickEnglishTranslation(translations, 'tagline') || englishOrEmpty(dto.tagline)
  const title =
    pickEnglishTranslation(translations, 'title') || englishOrEmpty(dto.title) || dto.title

  const listed = mapMovie({
    ...dto,
    title,
    overview,
    poster_path: pickEnglishImagePath(dto.images?.posters, dto.poster_path),
  })

  return {
    ...listed,
    posterUrl: posterUrl(
      pickEnglishImagePath(dto.images?.posters, dto.poster_path),
      'detail',
    ),
    originalTitle: dto.original_title?.trim() || listed.title,
    tagline: tagline || null,
    runtimeMinutes: dto.runtime && dto.runtime > 0 ? dto.runtime : null,
    genres: (dto.genres ?? []).map((genre) => genre.name).filter(Boolean),
    languages: mapLanguages(dto),
    countries: mapCountries(dto),
    backdropUrl: backdropUrl(
      pickEnglishImagePath(dto.images?.backdrops, dto.backdrop_path),
    ),
    voteCount: dto.vote_count ?? 0,
    director: pickDirector(dto),
    writers: mapCrewNames(dto, WRITER_JOBS),
    productionCompanies: mapProductionCompanies(dto),
    releaseDate: dto.release_date?.trim() || null,
    certification: pickCertification(dto),
    plot: null,
    highlights: mapHighlights(dto),
    cast: mapCast(dto),
    trailerYoutubeKey: pickYoutubeTrailer(dto.videos?.results),
    watch: mapWatchOptions(dto, BOLIVIA_ORIGIN_COUNTRY),
  }
}

function pickDirector(dto: TmdbMovieDetailDto): MoviePerson | null {
  const directors = (dto.credits?.crew ?? []).filter((person) => person.job === 'Director')
  if (directors.length === 0) return null

  const names = uniqueStrings(directors.map((person) => person.name.trim()).filter(Boolean))
  const chosen =
    directors.find((person) => person.profile_path) ?? directors[0]

  return {
    name: names.join(', ') || chosen.name,
    photoUrl: profileUrl(chosen.profile_path),
  }
}

function mapCrewNames(dto: TmdbMovieDetailDto, jobs: Set<string>): string[] {
  return uniqueStrings(
    (dto.credits?.crew ?? [])
      .filter((person) => jobs.has(person.job))
      .map((person) => person.name.trim())
      .filter(Boolean),
  )
}

function mapProductionCompanies(dto: TmdbMovieDetailDto): string[] {
  const companies = uniqueStrings(
    (dto.production_companies ?? [])
      .map((company) => company.name?.trim() ?? '')
      .filter(Boolean),
  )
  if (companies.length > 0) return companies

  return mapCrewNames(dto, new Set(['Producer']))
}

function pickCertification(dto: TmdbMovieDetailDto): string | null {
  const groups = dto.release_dates?.results ?? []
  for (const region of CERT_REGIONS) {
    const formatted = formatCertification(firstCertification(groups, region))
    if (formatted) return formatted
  }

  for (const group of groups) {
    const formatted = formatCertification(firstCertification([group]))
    if (formatted) return formatted
  }

  return null
}

function firstCertification(
  groups: NonNullable<TmdbMovieDetailDto['release_dates']>['results'],
  region?: string,
): string | null {
  const pool = (groups ?? []).filter((group) =>
    region ? group.iso_3166_1 === region : true,
  )

  for (const group of pool) {
    for (const item of group.release_dates ?? []) {
      const cert = item.certification?.trim()
      if (cert) return cert
    }
  }

  return null
}

function formatCertification(raw: string | null): string | null {
  if (!raw) return null
  const digits = raw.match(/(\d{1,2})/)
  if (digits) return `+${digits[1]}`
  return raw
}

function mapHighlights(dto: TmdbMovieDetailDto): MovieHighlight[] {
  const highlights: MovieHighlight[] = []
  const filmedInBolivia =
    (dto.production_countries ?? []).some(
      (country) => country.iso_3166_1 === BOLIVIA_ORIGIN_COUNTRY,
    ) || (dto.origin_country ?? []).includes(BOLIVIA_ORIGIN_COUNTRY)
  if (filmedInBolivia) {
    highlights.push({
      kind: 'bolivia',
      text: 'Shot entirely in Bolivia',
    })
  }

  const keywordNames = [
    ...(dto.keywords?.keywords ?? []),
    ...(dto.keywords?.results ?? []),
  ].map((keyword) => keyword.name)

  if (keywordNames.some((name) => TRUE_STORY_KEYWORD.test(name))) {
    highlights.push({
      kind: 'true-story',
      text: 'Inspired by true events',
    })
  }

  return highlights
}

const LANGUAGE_NAMES: Record<string, string> = {
  es: 'Spanish',
  ay: 'Aymara',
  qu: 'Quechua',
  gn: 'Guarani',
  en: 'English',
  pt: 'Portuguese',
  fr: 'French',
}

function mapLanguages(dto: TmdbMovieDetailDto): string[] {
  const spoken = (dto.spoken_languages ?? [])
    .map((language) => {
      const named = language.english_name?.trim() || language.name?.trim()
      if (named) return named
      if (language.iso_639_1 && LANGUAGE_NAMES[language.iso_639_1]) {
        return LANGUAGE_NAMES[language.iso_639_1]
      }
      return language.iso_639_1 ?? ''
    })
    .filter(Boolean)

  if (spoken.length > 0) return uniqueStrings(spoken)

  if (dto.original_language && LANGUAGE_NAMES[dto.original_language]) {
    return [LANGUAGE_NAMES[dto.original_language]]
  }

  return dto.original_language ? [dto.original_language] : []
}

function mapCountries(dto: TmdbMovieDetailDto): string[] {
  const named = (dto.production_countries ?? [])
    .map((country) => country.name?.trim() || country.iso_3166_1 || '')
    .filter(Boolean)

  if (named.length > 0) return uniqueStrings(named)
  return uniqueStrings(dto.origin_country ?? [])
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)]
}

function mapCast(dto: TmdbMovieDetailDto): MovieCastMember[] {
  return [...(dto.credits?.cast ?? [])]
    .sort((left, right) => (left.order ?? 99) - (right.order ?? 99))
    .slice(0, CAST_LIMIT)
    .map((person) => ({
      id: person.id,
      name: person.name,
      character: person.character,
      photoUrl: profileUrl(person.profile_path),
    }))
}

function pickYoutubeTrailer(videos: TmdbVideoDto[] | undefined): string | null {
  if (!videos?.length) return null

  const youtube = videos.filter((video) => video.site === 'YouTube' && video.key)
  const trailers = youtube.filter((video) => video.type === 'Trailer')
  const pool = trailers.length > 0 ? trailers : youtube

  const englishTrailers = pool.filter((video) => video.iso_639_1 === 'en')
  const englishPool = englishTrailers.length > 0 ? englishTrailers : pool
  const official = englishPool.find((video) => video.official)

  return official?.key ?? englishPool[0]?.key ?? null
}

function mapWatchOptions(
  dto: TmdbMovieDetailDto,
  region: string,
): MovieWatchOptions {
  const bundle = dto['watch/providers'] ?? dto.watch_providers
  const country: TmdbWatchCountryDto | undefined = bundle?.results?.[region]

  return {
    region,
    stream: uniqueProviders([
      ...(country?.flatrate ?? []),
      ...(country?.free ?? []),
      ...(country?.ads ?? []),
    ]),
    rent: uniqueProviders(country?.rent ?? []),
    buy: uniqueProviders(country?.buy ?? []),
    justWatchUrl: country?.link ?? null,
  }
}

function uniqueProviders(items: TmdbProviderDto[]): WatchProvider[] {
  const seen = new Set<number>()
  const providers: WatchProvider[] = []

  for (const item of items) {
    if (seen.has(item.provider_id)) continue
    seen.add(item.provider_id)
    providers.push({
      id: item.provider_id,
      name: item.provider_name,
      logoUrl: providerLogoUrl(item.logo_path),
    })
  }

  return providers
}
