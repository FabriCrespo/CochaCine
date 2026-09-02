import { CATALOG_SORT, type CatalogSort } from '../api/tmdb/sort.ts'
import type { FilmmakerFilm } from '../config/directors.ts'
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

export const HOME_POPULAR_LIMIT = 10

export const CATALOG_DECADES = [
  { id: '2020s', label: 'The 2020s', from: 2020, to: 2029 },
  { id: '2010s', label: 'The 2010s', from: 2010, to: 2019 },
  { id: '2000s', label: 'The 2000s', from: 2000, to: 2009 },
  { id: '1990s', label: 'The 1990s', from: 1990, to: 1999 },
  { id: '1980s', label: 'The 1980s', from: 1980, to: 1989 },
] as const

export function popularCatalogMovies(
  movies: Movie[],
  limit = HOME_POPULAR_LIMIT,
): Movie[] {
  return sortCatalogMovies(movies, CATALOG_SORT.popularity).slice(0, limit)
}

export function moviesInDecade(
  movies: Movie[],
  from: number,
  to: number,
): Movie[] {
  return sortCatalogMovies(
    movies.filter((movie) => {
      const year = Number(movie.releaseYear)
      return Number.isFinite(year) && year >= from && year <= to
    }),
    CATALOG_SORT.popularity,
  )
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

function foldTitle(value: string): string {
  return foldText(value)
    .replace(/[!¡¿?.,:;'"()[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function titleKeys(value: string): string[] {
  const folded = foldTitle(value)
  if (!folded) return []
  const keys = [folded]
  for (const part of folded.split(/\s+\/\s+|\s+-\s+/)) {
    if (part && part !== folded) keys.push(part)
  }
  return keys
}

function filmYear(year: number | string | undefined): number | null {
  if (year == null) return null
  const match = String(year).match(/\d{4}/)
  return match ? Number(match[0]) : null
}

export function matchCatalogMovie(
  movies: Movie[],
  film: Pick<
    FilmmakerFilm,
    'title' | 'english_title' | 'original_title' | 'alternative_title' | 'year'
  >,
): Movie | null {
  const names = [
    film.title,
    film.english_title,
    film.original_title,
    film.alternative_title,
  ].flatMap((name) => (name ? titleKeys(name) : []))

  return matchCatalogMovieByNames(movies, names, filmYear(film.year))
}

export function matchCatalogMovieByTitle(
  movies: Movie[],
  title: string,
  year?: number | string,
): Movie | null {
  return matchCatalogMovieByNames(movies, titleKeys(title), filmYear(year))
}

function matchCatalogMovieByNames(
  movies: Movie[],
  names: string[],
  year: number | null,
): Movie | null {
  const wanted = [...new Set(names.filter((name) => name.length >= 3))]
  if (wanted.length === 0) return null

  let best: Movie | null = null
  let bestScore = 0

  for (const movie of movies) {
    const catalogNames = [...titleKeys(movie.title), ...titleKeys(movie.originalTitle)]
    let score = 0

    for (const name of wanted) {
      for (const catalog of catalogNames) {
        if (catalog === name) score = Math.max(score, 4)
        else if (name.length >= 6 && (catalog.includes(name) || name.includes(catalog))) {
          score = Math.max(score, 2)
        }
      }
    }

    if (score === 0) continue

    const movieYear = Number(movie.releaseYear)
    if (year != null && Number.isFinite(movieYear)) {
      if (movieYear === year) score += 2
      else if (Math.abs(movieYear - year) === 1) score += 1
      else if (score < 4) continue
    }

    if (score > bestScore) {
      best = movie
      bestScore = score
    }
  }

  return bestScore >= 2 ? best : null
}
