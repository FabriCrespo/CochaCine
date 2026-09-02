/**
 * Cartelera editorial de La Hija Cóndor.
 * Enlaces de boletería buscados a mano (no TMDB / JustWatch).
 * Revisado: 1 Sep 2026.
 */

export type FeaturedTicketListing = {
  country: string
  place: string
  /** YYYY-MM-DD. Si es futura, va a Upcoming dates. */
  date: string | null
  /** Último día conocido en cartelera. */
  until: string | null
  ticketsUrl: string
}

export const LA_HIJA_CONDOR_TICKETS: FeaturedTicketListing[] = [
  {
    country: 'France',
    place: 'AlloCiné — nationwide showtimes',
    date: null,
    until: null,
    ticketsUrl: 'https://www.allocine.fr/seance/film-1000022452/pres-de-115755/',
  },
  {
    country: 'Switzerland',
    place: 'trigon-film — current screenings',
    date: null,
    until: '2026-10-10',
    ticketsUrl: 'https://trigon-film.org/en/films/la-hija-condor/',
  },
  {
    country: 'Mexico',
    place: 'Cineteca Nacional',
    date: null,
    until: '2026-09-10',
    ticketsUrl: 'https://rbvfcn.cinetecanacional.net/Browsing/Movies/Details/h-HO00009787',
  },
  {
    country: 'United States',
    place: 'Cinema Village, New York',
    date: '2026-09-11',
    until: null,
    ticketsUrl: 'https://www.fandango.com/the-condor-daughter-244896/movie-overview',
  },
  {
    country: 'United States',
    place: 'Los Angeles',
    date: '2026-09-18',
    until: null,
    ticketsUrl: 'https://www.fandango.com/the-condor-daughter-244896/movie-overview',
  },
]
