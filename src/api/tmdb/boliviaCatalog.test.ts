import { describe, expect, it } from 'vitest'
import type { TmdbMovieListItemDto } from './tmdb.types.ts'
import {
  catalogTitlesMatch,
  isBolivianCatalogMovie,
} from './boliviaCatalog.ts'

function dto(partial: Partial<TmdbMovieListItemDto> & { id: number; title: string }): TmdbMovieListItemDto {
  return {
    overview: '',
    vote_average: 0,
    poster_path: '/p.jpg',
    release_date: '1995-01-01',
    ...partial,
  }
}

describe('isBolivianCatalogMovie — country veto', () => {
  it('keeps a Bolivian film that TMDB files as Spanish (es + BO production)', () => {
    expect(
      isBolivianCatalogMovie(
        dto({
          id: 107586,
          title: 'A Matter of Faith',
          original_title: 'Cuestión de fe',
          original_language: 'es',
          production_country_codes: ['BO'],
        }),
      ),
    ).toBe(true)
  })

  it('keeps Llamita: BO+ES, spoken Spanish, mis-tagged as English — not a foreign shoot', () => {
    expect(
      isBolivianCatalogMovie(
        dto({
          id: 900001,
          title: 'Llamita',
          original_language: 'en',
          production_country_codes: ['BO', 'ES'],
        }),
      ),
    ).toBe(true)
  })

  it('vetoes a foreign shoot: Bolivia as landscape among 3+ countries and a non-catalog language', () => {
    expect(
      isBolivianCatalogMovie(
        dto({
          id: 900002,
          title: 'Andean Western',
          original_language: 'en',
          production_country_codes: ['BO', 'US', 'GB'],
        }),
      ),
    ).toBe(false)
  })

  it('vetoes Blackthorn even though Wikidata lists it as produced in Bolivia', () => {
    expect(
      isBolivianCatalogMovie(
        dto({
          id: 68818,
          title: 'Blackthorn',
          original_language: 'en',
          production_country_codes: ['BO', 'ES', 'FR'],
        }),
      ),
    ).toBe(false)
  })

  it('drops adult titles and the sexóloga junk pattern', () => {
    expect(
      isBolivianCatalogMovie(
        dto({
          id: 1,
          title: 'Anything',
          adult: true,
          original_language: 'es',
          production_country_codes: ['BO'],
        }),
      ),
    ).toBe(false)

    expect(
      isBolivianCatalogMovie(
        dto({
          id: 525686,
          title: 'Mi prima la sexóloga',
          original_language: 'es',
          production_country_codes: ['BO'],
        }),
      ),
    ).toBe(false)
  })

  it('lets an editor allow-list bypass the country veto, but not adult', () => {
    const foreign = dto({
      id: 900003,
      title: 'Guest title',
      original_language: 'en',
      production_country_codes: ['BO', 'US', 'FR'],
    })
    expect(isBolivianCatalogMovie(foreign)).toBe(false)
    expect(isBolivianCatalogMovie(foreign, new Set([900003]))).toBe(true)
    expect(
      isBolivianCatalogMovie({ ...foreign, adult: true }, new Set([900003])),
    ).toBe(false)
  })

  it('rejects English-language films with no Bolivian production country', () => {
    expect(
      isBolivianCatalogMovie(
        dto({
          id: 900004,
          title: 'Some Hollywood film',
          original_language: 'en',
          production_country_codes: ['US'],
        }),
      ),
    ).toBe(false)
  })
})

describe('catalogTitlesMatch — harvest title lookup', () => {
  const yawar = dto({
    id: 107584,
    title: 'Blood of the Condor',
    original_title: 'Yawar Mallku',
  })

  it('matches accented and folded titles', () => {
    expect(catalogTitlesMatch('Yawar Mallku', yawar)).toBe(true)
    expect(catalogTitlesMatch('yawar mallkú', yawar)).toBe(true)
    expect(catalogTitlesMatch('Blood of the Condor', yawar)).toBe(true)
  })

  it('does not match a short unrelated needle', () => {
    expect(catalogTitlesMatch('fe', yawar)).toBe(false)
  })
})
