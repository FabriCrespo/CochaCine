export const IMDB_ENDPOINTS = {
  titlePage: (imdbId: string) =>
    `https://r.jina.ai/https://www.imdb.com/title/${imdbId}/`,
} as const
