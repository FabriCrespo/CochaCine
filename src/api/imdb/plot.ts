/**
 * Extrae el plot en inglés de la ficha pública de IMDb (markdown del lector).
 */

import { looksLikeSpanish } from '../tmdb/englishText.ts'

const UI_NOISE =
  /IMDb|Watchlist|Sign in|Contribute|Top Cast|Photos |Language English|For industry|Keyboard|Privacy|Born today|Release calendar|Mark as watched|Add to Watchlist|Critic reviews/i

function collapse(markdown: string): string {
  return markdown
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[Read all]\([^)]*\)/gi, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function firstCopy(text: string): string {
  const start = text.slice(0, 48)
  if (start.length < 24) return text
  const repeatAt = text.indexOf(start, 24)
  return (repeatAt > 0 ? text.slice(0, repeatAt) : text).trim()
}

export function extractImdbPlot(markdown: string): string {
  const text = collapse(markdown)
  const section =
    text.match(
      /\b(?:Drama|Comedy|Crime|Thriller|Documentary|Romance|Adventure|Horror|Action)\b\s+(.+?)\s+Director\b/i,
    )?.[1] ?? ''

  const fromSection = firstCopy(section.replace(/\s+/g, ' ').trim())
  if (isUsablePlot(fromSection)) return fromSection

  const sentences = text.match(/[A-Z][\s\S]{80,700}?[.!](?=\s|$|[A-Z])/g) ?? []
  const ranked = sentences
    .map((item) => firstCopy(item.replace(/\s+/g, ' ').trim()))
    .filter(isUsablePlot)
    .sort((left, right) => right.length - left.length)

  return ranked[0] ?? ''
}

function isUsablePlot(text: string): boolean {
  if (text.length < 90 || text.length > 800) return false
  if (UI_NOISE.test(text)) return false
  if (looksLikeSpanish(text)) return false
  return /\b(the|their|they|with|from|that|which|and|are|was|were)\b/i.test(text)
}
