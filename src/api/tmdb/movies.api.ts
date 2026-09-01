/**
 * =============================================================================
 * API DE PELÍCULAS (capa de datos)
 * =============================================================================
 *
 * Habla con TMDB. Aquí SÍ se usa Axios. Aquí NO hay React ni useQuery.
 *
 * Cada función es async, recibe parámetros tipados y DEVUELVE el dominio.
 *
 * El genérico de Axios es el DTO, no el dominio:
 *   axiosClient.get<TmdbPopularMoviesDto>(...)
 *   → data es TmdbPopularMoviesDto
 *   → mapPopularMoviesPage(data) es PopularMoviesPage
 *
 * ---------------------------------------------------------------------------
 * RECETA PARA AGREGAR OTRO ENDPOINT (cópiala)
 * ---------------------------------------------------------------------------
 * GET /movie/{id}
 *
 * 1. tmdb.types.ts     → TmdbMovieDetailDto
 * 2. domain/movie.ts   → MovieDetail
 * 3. endpoints.ts      → detail: (id: number) => `/movie/${id}`
 * 4. mappers.ts        → mapMovieDetail(dto): MovieDetail
 * 5. ESTE archivo:
 *      export async function fetchMovieById(id: number): Promise<MovieDetail> {
 *        const { data } = await axiosClient.get<TmdbMovieDetailDto>(
 *          TMDB_ENDPOINTS.movies.detail(id),
 *          { params: { language: DEFAULT_LANGUAGE } },
 *        )
 *        return mapMovieDetail(data)
 *      }
 * 6. query/keys.ts     → detail: (id: number) => [...movieKeys.all, 'detail', id]
 * 7. query/movies/useMovie.ts
 *      useQuery<MovieDetail, AppError>({ queryKey: movieKeys.detail(id), queryFn: () => fetchMovieById(id), enabled: id > 0 })
 * 8. features/movies/MovieDetailPage.tsx
 *
 * No saltes capas. No llames axiosClient desde un componente.
 */

import { DEFAULT_LANGUAGE, TMDB_IMAGE_LANGUAGES, TMDB_PERSON_MARCOS_LOAYZA } from '../../config/constants.ts'
import type { Movie, MovieDetail, MovieGenre, PopularMoviesPage } from '../../domain/movie.ts'
import { AppError } from '../http/errors.ts'
import { fetchImdbPlot } from '../imdb/plot.api.ts'
import { parseCatalogAddInput } from '../../lib/catalogAdd.ts'
import { applyMovieDetailOverride, applyMovieOverride } from '../supabase/merge.ts'
import {
  fetchManualCatalogIds,
  insertManualCatalogMovie,
} from '../supabase/catalogManual.api.ts'
import { fetchMovieOverride, fetchMovieOverrides } from '../supabase/overrides.api.ts'
import { axiosClient } from '../http/axiosClient.ts'
import {
  BOLIVIA_PRODUCED_TMDB_IDS,
  BOLIVIA_UNRESOLVED_TITLES,
} from './boliviaProducedIds.ts'
import {
  bolivianCatalogDiscoverParams,
  catalogTitlesMatch,
  hasBolivianProductionCountry,
  isBolivianCatalogMovie,
  MAX_BOLIVIAN_DISCOVER_PAGES,
  TMDB_KEYWORD_BOLIVIA,
} from './boliviaCatalog.ts'
import { TMDB_ENDPOINTS } from './endpoints.ts'
import { mapMovie, mapMovieDetail, mapMovieListItemFromDetail, mapPopularMoviesPage } from './mappers.ts'
import type {
  TmdbFindDto,
  TmdbMovieDetailDto,
  TmdbMovieImagesDto,
  TmdbMovieListItemDto,
  TmdbPersonMovieCreditsDto,
  TmdbPopularMoviesDto,
  TmdbVideoDto,
} from './tmdb.types.ts'

const ENGLISH_MEDIA_PARAMS = {
  language: DEFAULT_LANGUAGE,
  include_image_language: TMDB_IMAGE_LANGUAGES,
} as const

/**
 * GET /discover/movie — catálogo entero (varias páginas), no una sola.
 * El orden lo aplica la página principal en cliente (filtros + sort).
 */
export async function fetchBolivianMovies(): Promise<PopularMoviesPage> {
  const [fromCountry, fromKeyword, manualIds] = await Promise.all([
    collectDiscoverPages('country'),
    collectDiscoverPages('keyword'),
    fetchManualCatalogIds(),
  ])
  const allowIds = new Set(manualIds)

  const discoveredIds = new Set(
    [...fromCountry, ...fromKeyword].map((item) => item.id),
  )
  const missingIds = uniqueNumbers([
    ...BOLIVIA_PRODUCED_TMDB_IDS.filter((id) => !discoveredIds.has(id)),
    ...manualIds.filter((id) => !discoveredIds.has(id)),
  ])

  const [fromProduced, fromTitles] = await Promise.all([
    fetchMoviesByIds(missingIds),
    resolveUnresolvedBolivianTitles(discoveredIds),
  ])

  const unique = uniqueById([
    ...fromProduced,
    ...fromTitles,
    ...fromCountry,
    ...fromKeyword,
  ])
  const catalog = unique.filter((item) => isBolivianCatalogMovie(item, allowIds))

  console.log(
    `[TMDB] Bolivian catalog: country=${fromCountry.length}, keyword=${fromKeyword.length}, wikidata=${fromProduced.length}, titles=${fromTitles.length}, manual=${manualIds.length}, unique=${unique.length}, visible=${catalog.length}`,
  )

  const page = mapPopularMoviesPage({
    page: 1,
    total_pages: 1,
    total_results: catalog.length,
    results: catalog,
  })

  const overrides = await fetchMovieOverrides(page.movies.map((movie) => movie.id))
  const movies = page.movies.map((movie) =>
    applyMovieOverride(movie, overrides.get(movie.id)),
  )

  return { ...page, movies }
}

async function collectDiscoverPages(
  source: 'country' | 'keyword',
): Promise<TmdbMovieListItemDto[]> {
  const first = await getDiscoverPage(1, source)
  const totalPages = Math.min(first.total_pages ?? 1, MAX_BOLIVIAN_DISCOVER_PAGES)
  const extra =
    totalPages > 1
      ? await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, index) =>
            getDiscoverPage(index + 2, source),
          ),
        )
      : []

  return [first, ...extra].flatMap((page) => page.results ?? [])
}

async function getDiscoverPage(
  page: number,
  source: 'country' | 'keyword',
): Promise<TmdbPopularMoviesDto> {
  const { data } = await axiosClient.get<TmdbPopularMoviesDto>(
    TMDB_ENDPOINTS.movies.discover,
    {
      params: {
        page,
        ...(source === 'country'
          ? bolivianCatalogDiscoverParams({ includeLanguages: false })
          : {
              ...ENGLISH_MEDIA_PARAMS,
              include_adult: false,
              with_keywords: String(TMDB_KEYWORD_BOLIVIA),
              sort_by: 'popularity.desc',
            }),
      },
    },
  )

  return data
}

async function fetchMoviesByIds(ids: readonly number[]): Promise<TmdbMovieListItemDto[]> {
  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        const { data } = await axiosClient.get<TmdbMovieDetailDto>(
          TMDB_ENDPOINTS.movies.detail(id),
          { params: { ...ENGLISH_MEDIA_PARAMS, append_to_response: 'images,translations' } },
        )
        return mapMovieListItemFromDetail(data)
      } catch {
        return null
      }
    }),
  )

  return results.filter((item): item is TmdbMovieListItemDto => item !== null)
}

async function resolveUnresolvedBolivianTitles(
  alreadyHave: Set<number>,
): Promise<TmdbMovieListItemDto[]> {
  const results = await Promise.all(
    BOLIVIA_UNRESOLVED_TITLES.map((title) => resolveTitleOnTmdb(title, alreadyHave)),
  )
  return results.filter((item): item is TmdbMovieListItemDto => item !== null)
}

async function resolveTitleOnTmdb(
  title: string,
  alreadyHave: Set<number>,
): Promise<TmdbMovieListItemDto | null> {
  try {
    const { data } = await axiosClient.get<TmdbPopularMoviesDto>(
      TMDB_ENDPOINTS.movies.search,
      {
        params: {
          query: title,
          include_adult: false,
          ...ENGLISH_MEDIA_PARAMS,
        },
      },
    )

    for (const candidate of (data.results ?? []).slice(0, 3)) {
      if (alreadyHave.has(candidate.id)) continue
      if (!catalogTitlesMatch(title, candidate)) continue

      const { data: detail } = await axiosClient.get<TmdbMovieDetailDto>(
        TMDB_ENDPOINTS.movies.detail(candidate.id),
        { params: { ...ENGLISH_MEDIA_PARAMS, append_to_response: 'images,translations' } },
      )
      const item = mapMovieListItemFromDetail(detail)
      if (hasBolivianProductionCountry(item) && isBolivianCatalogMovie(item)) {
        return item
      }
    }
  } catch {
    return null
  }

  return null
}

function uniqueById(items: TmdbMovieListItemDto[]): TmdbMovieListItemDto[] {
  const seen = new Set<number>()
  return items.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

function uniqueNumbers(ids: number[]): number[] {
  return [...new Set(ids.filter((id) => id > 0))]
}

export async function addCatalogMovieFromInput(input: string): Promise<Movie> {
  const parsed = parseCatalogAddInput(input)
  if (!parsed) {
    throw new AppError(
      'Paste an IMDb title URL or ID (tt1234567). A TMDB movie URL also works.',
      'HTTP',
      null,
    )
  }

  let tmdbId = parsed.tmdbId
  if (!tmdbId && parsed.imdbId) {
    tmdbId = await findTmdbIdByImdbId(parsed.imdbId)
  }

  if (!tmdbId) {
    throw new AppError(
      'TMDB has no movie for that IMDb title. TV series cannot be added.',
      'HTTP',
      404,
    )
  }

  await insertManualCatalogMovie(tmdbId, parsed.imdbId)
  const items = await fetchMoviesByIds([tmdbId])
  if (items.length === 0) {
    throw new AppError('Could not load that title from TMDB.', 'HTTP', 404)
  }

  const movie = mapMovie(items[0])
  const override = await fetchMovieOverride(tmdbId)
  return applyMovieOverride(movie, override ?? undefined)
}

async function findTmdbIdByImdbId(imdbId: string): Promise<number | null> {
  const { data } = await axiosClient.get<TmdbFindDto>(TMDB_ENDPOINTS.movies.find(imdbId), {
    params: {
      ...ENGLISH_MEDIA_PARAMS,
      external_source: 'imdb_id',
    },
  })

  const match = (data.movie_results ?? []).find((item) => item.id > 0)
  return match?.id ?? null
}

export async function fetchMovieGenres(): Promise<MovieGenre[]> {
  const { data } = await axiosClient.get<{ genres?: MovieGenre[] }>(
    TMDB_ENDPOINTS.genres.movieList,
    { params: { language: DEFAULT_LANGUAGE } },
  )
  return data.genres ?? []
}

/**
 * GET /person/{id}/movie_credits — solo créditos como Director.
 */
export async function fetchMoviesDirectedBy(
  personId: number,
): Promise<Movie[]> {
  const { data } = await axiosClient.get<TmdbPersonMovieCreditsDto>(
    TMDB_ENDPOINTS.people.movieCredits(personId),
    { params: ENGLISH_MEDIA_PARAMS },
  )

  const directed = uniqueById(
    (data.crew ?? []).filter(
      (credit) => credit.job === 'Director' && !credit.adult && credit.id > 0,
    ),
  ).sort((left, right) =>
    (right.release_date ?? '').localeCompare(left.release_date ?? ''),
  )

  const movies = directed.map(mapMovie)
  const overrides = await fetchMovieOverrides(movies.map((movie) => movie.id))
  return movies.map((movie) => applyMovieOverride(movie, overrides.get(movie.id)))
}

export async function fetchMarcosLoayzaMovies(): Promise<Movie[]> {
  return fetchMoviesDirectedBy(TMDB_PERSON_MARCOS_LOAYZA)
}

/**
 * TMDB + IMDb, sin overlay editorial. El admin compara contra esto.
 */
export async function fetchMovieByIdFromSources(id: number): Promise<MovieDetail> {
  const [detailResponse, videos, images] = await Promise.all([
    axiosClient.get<TmdbMovieDetailDto>(TMDB_ENDPOINTS.movies.detail(id), {
      params: {
        ...ENGLISH_MEDIA_PARAMS,
        append_to_response: 'credits,translations,keywords,release_dates',
      },
    }),
    fetchMovieVideos(id),
    fetchMovieImages(id),
  ])

  let mapped = mapMovieDetail({
    ...detailResponse.data,
    videos,
    images,
  })

  if (!mapped.overview.trim()) {
    const imdbPlot = await fetchImdbPlot(tmdbImdbId(detailResponse.data))
    if (imdbPlot) mapped = { ...mapped, overview: imdbPlot }
  }

  return mapped
}

/**
 * GET /movie/{id} + créditos, imágenes en inglés y trailer en inglés.
 * Si TMDB no tiene sinopsis en inglés, usamos el plot de IMDb.
 * Después pisa Supabase si hay corrección editorial.
 */
export async function fetchMovieById(id: number): Promise<MovieDetail> {
  const mapped = await fetchMovieByIdFromSources(id)
  const override = await fetchMovieOverride(id)
  return applyMovieDetailOverride(mapped, override ?? undefined)
}

function tmdbImdbId(dto: TmdbMovieDetailDto): string {
  return dto.imdb_id ?? dto.external_ids?.imdb_id ?? ''
}

async function fetchMovieImages(id: number) {
  try {
    const { data } = await axiosClient.get<TmdbMovieImagesDto>(
      TMDB_ENDPOINTS.movies.images(id),
      { params: { include_image_language: TMDB_IMAGE_LANGUAGES } },
    )
    return data
  } catch {
    return { posters: [], backdrops: [] }
  }
}

async function fetchMovieVideos(id: number): Promise<{ results: TmdbVideoDto[] }> {
  const english = await getMovieVideos(id, DEFAULT_LANGUAGE)
  if (english.some((video) => video.site === 'YouTube' && video.key)) {
    return { results: english }
  }

  const anyLanguage = await getMovieVideos(id)
  return { results: anyLanguage }
}

async function getMovieVideos(
  id: number,
  language?: string,
): Promise<TmdbVideoDto[]> {
  try {
    const { data } = await axiosClient.get<{ results?: TmdbVideoDto[] }>(
      TMDB_ENDPOINTS.movies.videos(id),
      language ? { params: { language } } : undefined,
    )
    return data.results ?? []
  } catch {
    return []
  }
}
