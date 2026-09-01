export function parseImdbId(input: string): string | null {
  const match = input.trim().match(/tt\d{5,}/i)
  return match ? match[0].toLowerCase() : null
}

export function parseTmdbMovieId(input: string): number | null {
  const trimmed = input.trim()
  const fromUrl = trimmed.match(/themoviedb\.org\/movie\/(\d+)/i)
  if (fromUrl) {
    const id = Number(fromUrl[1])
    return id > 0 ? id : null
  }
  return null
}

export type CatalogAddInput = {
  imdbId: string | null
  tmdbId: number | null
}

export function parseCatalogAddInput(raw: string): CatalogAddInput | null {
  const imdbId = parseImdbId(raw)
  const tmdbId = parseTmdbMovieId(raw)
  if (!imdbId && !tmdbId) return null
  return { imdbId, tmdbId }
}
