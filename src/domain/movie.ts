/**
 * =============================================================================
 * MODELO DE DOMINIO: Movie
 * =============================================================================
 *
 * Esto es "nuestra" película, no la de TMDB.
 *
 * La API manda `vote_average`, `poster_path`, `release_date`.
 * La UI usa `rating`, `posterUrl`, `releaseYear`.
 *
 * ¿Por qué dos formas?
 *   TypeScript te obliga a mapear (ver mappers.ts). Si un componente
 *   intenta usar `movie.vote_average`, el compilador grita.
 *   Eso es exactamente lo que queremos.
 *
 * Cómo agregar campos (ej. géneros en un detalle):
 *   export type MovieDetail = Movie & {
 *     runtime: number | null
 *     genres: string[]
 *   }
 */

export type Movie = {
  id: number
  title: string
  originalTitle: string
  overview: string
  rating: number
  popularity: number
  voteCount: number
  posterUrl: string | null
  releaseYear: string | null
  genreIds: number[]
}

export type MovieGenre = {
  id: number
  name: string
}

export type PopularMoviesPage = {
  page: number
  totalPages: number
  totalResults: number
  movies: Movie[]
}

export type MovieCastMember = {
  id: number
  name: string
  character: string
  photoUrl: string | null
}

export type WatchProvider = {
  id: number
  name: string
  logoUrl: string | null
}

export type MovieWatchOptions = {
  region: string
  stream: WatchProvider[]
  rent: WatchProvider[]
  buy: WatchProvider[]
  justWatchUrl: string | null
}

export type MoviePerson = {
  name: string
  photoUrl: string | null
}

export type MovieDetail = Movie & {
  originalTitle: string
  tagline: string | null
  runtimeMinutes: number | null
  genres: string[]
  languages: string[]
  countries: string[]
  backdropUrl: string | null
  director: MoviePerson | null
  cast: MovieCastMember[]
  trailerYoutubeKey: string | null
  watch: MovieWatchOptions
}
