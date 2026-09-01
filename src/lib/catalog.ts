import { CATALOG_SORT, type CatalogSort } from '../api/tmdb/sort.ts'
import type { Movie, MovieGenre } from '../domain/movie.ts'

export function filterCatalogMovies(
  movies: Movie[],
  query: string,
  selectedGenreIds: number[],
  selectedYear: string,
): Movie[] {
  const needle = foldText(query)

  return movies.filter((movie) => {
    if (needle) {
      const haystack = foldText(`${movie.title} ${movie.originalTitle}`)
      if (!haystack.includes(needle)) return false
    }

    if (selectedGenreIds.length > 0) {
      const matchesGenre = selectedGenreIds.some((id) => movie.genreIds.includes(id))
      if (!matchesGenre) return false
    }

    if (selectedYear) {
      if (movie.releaseYear !== selectedYear) return false
    }

    return true
  })
}

export function suggestCatalogMovies(
  movies: Movie[],
  query: string,
  limit = 8,
): Movie[] {
  const needle = foldText(query)
  if (!needle) return []

  const ranked = movies
    .map((movie) => ({ movie, score: suggestionScore(movie, needle) }))
    .filter((item) => item.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score || right.movie.popularity - left.movie.popularity,
    )

  return ranked.slice(0, limit).map((item) => item.movie)
}

function suggestionScore(movie: Movie, needle: string): number {
  const title = foldText(movie.title)
  const original = foldText(movie.originalTitle)
  if (title === needle || original === needle) return 3
  if (title.startsWith(needle) || original.startsWith(needle)) return 2
  if (title.includes(needle) || original.includes(needle)) return 1
  return 0
}

export function similarCatalogMovies(
  movies: Movie[],
  current: { id: number; genreIds: number[] },
  limit = 10,
): Movie[] {
  const wanted = new Set(current.genreIds)
  const ranked = movies
    .filter((movie) => movie.id !== current.id)
    .map((movie) => ({
      movie,
      overlap: movie.genreIds.filter((id) => wanted.has(id)).length,
    }))
    .sort(
      (left, right) =>
        right.overlap - left.overlap ||
        right.movie.popularity - left.movie.popularity,
    )

  return ranked.slice(0, limit).map((item) => item.movie)
}

export function sortCatalogMovies(movies: Movie[], sortBy: CatalogSort): Movie[] {
  return [...movies].sort((left, right) => compareMovies(left, right, sortBy))
}

export function yearsPresentInCatalog(movies: Movie[]): string[] {
  const years = new Set<string>()
  for (const movie of movies) {
    if (movie.releaseYear) years.add(movie.releaseYear)
  }
  return [...years].sort((left, right) => right.localeCompare(left, 'en'))
}

export function genresPresentInCatalog(
  movies: Movie[],
  genres: MovieGenre[],
): MovieGenre[] {
  const present = new Set(movies.flatMap((movie) => movie.genreIds))
  return genres
    .filter((genre) => present.has(genre.id))
    .sort((left, right) => left.name.localeCompare(right.name, 'en'))
}

function compareMovies(left: Movie, right: Movie, sortBy: CatalogSort): number {
  switch (sortBy) {
    case CATALOG_SORT.featured:
      return (
        Number(isFeaturedRecord(right)) - Number(isFeaturedRecord(left)) ||
        right.popularity - left.popularity
      )
    case CATALOG_SORT.popularity:
      return right.popularity - left.popularity
    case CATALOG_SORT.newest:
      return yearValue(right) - yearValue(left)
    case CATALOG_SORT.oldest:
      return yearValue(left) - yearValue(right)
    case CATALOG_SORT.rating:
      return right.rating - left.rating || right.voteCount - left.voteCount
    case CATALOG_SORT.mostVoted:
      return right.voteCount - left.voteCount
    case CATALOG_SORT.title:
      return foldText(left.title).localeCompare(foldText(right.title), 'en')
    default:
      return 0
  }
}

function isFeaturedRecord(movie: Movie): boolean {
  return Boolean(
    movie.posterUrl &&
      movie.overview.trim() &&
      movie.releaseYear &&
      movie.genreIds.length > 0,
  )
}

function yearValue(movie: Movie): number {
  const year = Number(movie.releaseYear)
  return Number.isFinite(year) ? year : 0
}

function foldText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}
