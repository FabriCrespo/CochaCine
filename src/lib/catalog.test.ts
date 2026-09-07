import { describe, expect, it } from 'vitest'
import type { Movie } from '../domain/movie.ts'
import { filterCatalogMovies, matchCatalogMovie, matchCatalogMovieByTitle, primaryGenreName, archiveSpotlightMovies } from './catalog.ts'

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
    directorName: null,
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

describe('primaryGenreName', () => {
  it('uses the first genre id that exists in the list', () => {
    const title = movie({
      id: 1,
      title: 'X',
      genreIds: [18, 99],
    })
    expect(
      primaryGenreName(title, [
        { id: 99, name: 'Documentary' },
        { id: 18, name: 'Drama' },
      ]),
    ).toBe('Drama')
  })
})

describe('archiveSpotlightMovies', () => {
  it('skips titles without posters and puts beloved first', () => {
    const pool = archiveSpotlightMovies(
      [
        movie({ id: 1, title: 'No still', posterUrl: null, popularity: 90 }),
        movie({ id: 2, title: 'Quiet', popularity: 10 }),
        movie({ id: 3, title: 'Beloved', popularity: 1 }),
      ],
      [3],
      5,
    )
    expect(pool.map((item) => item.id)).toEqual([3, 2])
  })
})

describe('filterCatalogMovies — decade', () => {
  it('keeps titles in the chosen decade', () => {
    const titles = [
      movie({ id: 1, title: 'Sixties', releaseYear: '1969' }),
      movie({ id: 2, title: 'Nineties', releaseYear: '1995' }),
    ]
    expect(filterCatalogMovies(titles, '', [], '', '1960s').map((item) => item.id)).toEqual([1])
  })
})
