/**
 * =============================================================================
 * URLs DE IMÁGENES DE TMDB
 * =============================================================================
 *
 * TMDB manda `poster_path: "/abc.jpg"`, no una URL completa.
 * Esta función arma: IMAGE_BASE + tamaño + path.
 *
 * Si no hay path, devolvemos null y la UI muestra un placeholder.
 *
 * Cómo se usa:
 *   posterUrl(dto.poster_path)            → w500 (tarjeta)
 *   posterUrl(dto.poster_path, 'detail')  → w780
 */

import {
  TMDB_BACKDROP_SIZE,
  TMDB_IMAGE_BASE_URL,
  TMDB_POSTER_SIZE,
  TMDB_PROFILE_SIZE,
  TMDB_PROVIDER_LOGO_SIZE,
  type PosterSize,
} from '../../config/constants.ts'
import type { TmdbImageFileDto } from './tmdb.types.ts'

function tmdbImageUrl(size: string, path: string | null | undefined): string | null {
  if (!path) return null
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`
}

export function posterUrl(
  path: string | null | undefined,
  size: PosterSize = 'card',
): string | null {
  return tmdbImageUrl(TMDB_POSTER_SIZE[size], path)
}

export function backdropUrl(path: string | null | undefined): string | null {
  return tmdbImageUrl(TMDB_BACKDROP_SIZE, path)
}

export function profileUrl(path: string | null | undefined): string | null {
  return tmdbImageUrl(TMDB_PROFILE_SIZE, path)
}

export function providerLogoUrl(path: string | null | undefined): string | null {
  return tmdbImageUrl(TMDB_PROVIDER_LOGO_SIZE, path)
}

/** Inglés primero; si no hay, arte sin idioma; si no, el path que mandó TMDB. */
export function pickEnglishImagePath(
  images: TmdbImageFileDto[] | undefined,
  fallback: string | null | undefined,
): string | null {
  const ranked = [...(images ?? [])]
    .filter((item) => item.file_path)
    .sort((left, right) => (right.vote_average ?? 0) - (left.vote_average ?? 0))

  const english = ranked.find((item) => item.iso_639_1 === 'en')
  if (english) return english.file_path

  const neutral = ranked.find((item) => !item.iso_639_1)
  if (neutral) return neutral.file_path

  return fallback ?? null
}
