/**
 * TMDB a veces pega el overview original (español) en el locale en-US.
 * Pedir language=en-US no basta: hay que tirar el texto si no es inglés.
 */

import type { TmdbTranslationDto } from './tmdb.types.ts'

const SPANISH_WORDS =
  /\b(el|la|los|las|un|una|unos|unas|del|que|es|en|por|para|con|esta|este|estos|estas|desde|hacia|pero|durante|también|cuando|donde|sobre|entre|sin|sus|su|al|lo|le|se|una|película|pelicula|largometraje|dirigid[ao]|protagonistas?|trata|trasladad[ao]|encargo|pobladores|región|region)\b/gi

export function looksLikeSpanish(text: string): boolean {
  const value = text.trim()
  if (!value) return false
  if (/[ñ¿¡]/i.test(value)) return true

  const hits = value.match(SPANISH_WORDS)?.length ?? 0
  const words = value.split(/\s+/).filter(Boolean).length
  if (hits >= 4 && words >= 8) return true
  if (/[áéíóúü]/i.test(value) && hits >= 2) return true

  return false
}

export function englishOrEmpty(text: string | null | undefined): string {
  const value = text?.trim() ?? ''
  if (!value || looksLikeSpanish(value)) return ''
  return value
}

export function pickEnglishTranslation(
  translations: TmdbTranslationDto[] | undefined,
  field: 'title' | 'overview' | 'tagline',
): string {
  const english = translations
    ?.filter((item) => item.iso_639_1 === 'en')
    .map((item) => item.data?.[field]?.trim() ?? '')
    .find((value) => value && !looksLikeSpanish(value))

  return english ?? ''
}
