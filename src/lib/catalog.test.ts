import { describe, expect, it } from 'vitest'
import type { Movie } from '../domain/movie.ts'
import { matchCatalogMovie, matchCatalogMovieByTitle } from './catalog.ts'

function movie(partial: Partial<Movie> & Pick<Movie, 'id' | 'title'>): Movie {
  return {
    originalTitle: partial.originalTitle ?? partial.title,
    overview: '',
    rating: 0,
    popularity: 0,
    voteCount: 0,
    posterUrl: '/p.jpg',
    releaseYear: '1969',
    genreIds: [],
    ...partial,
  }
}

const catalog = [
  movie({
    id: 107584,
    title: 'Blood of the Condor',
    originalTitle: 'Yawar Mallku',
    releaseYear: '1969',
  }),
  movie({
    id: 107586,
    title: 'A Matter of Faith',
    originalTitle: 'Cuestión de fe',
    releaseYear: '1995',
  }),
  movie({
    id: 41330,
    title: 'The Secret Nation',
    originalTitle: 'La nación clandestina',
    releaseYear: '1989',
  }),
]

describe('matchCatalogMovie — editorial names vs TMDB records', () => {
  it('folds accents: Cuestión de fe finds the English TMDB title', () => {
    const found = matchCatalogMovieByTitle(catalog, 'Cuestión de fe', 1995)
    expect(found?.id).toBe(107586)
  })

  it('matches Yawar Mallku to Blood of the Condor in the same year', () => {
    const found = matchCatalogMovie(catalog, {
      title: 'Yawar Mallku',
      english_title: 'Blood of the Condor',
      year: 1969,
    })
    expect(found?.id).toBe(107584)
  })

  it('still matches when the year is off by one', () => {
    const found = matchCatalogMovieByTitle(catalog, 'La nación clandestina', 1990)
    expect(found?.id).toBe(41330)
  })

  it('refuses a weak match with a far-off year', () => {
    const found = matchCatalogMovieByTitle(catalog, 'nación', 2010)
    expect(found).toBeNull()
  })

  it('returns null when nothing scores', () => {
    expect(matchCatalogMovieByTitle(catalog, 'zxq', 1995)).toBeNull()
  })
})
