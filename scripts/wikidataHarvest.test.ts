import { describe, expect, it } from 'vitest'
import { parseWikidataBindings } from './wikidataHarvest.mjs'

describe('parseWikidataBindings — P495 harvest', () => {
  it('collects unique TMDB ids (P4947) and sorts them', () => {
    const { ids, unresolvedTitles } = parseWikidataBindings([
      { filmLabel: { value: 'Cuestión de fe' }, tmdb: { value: '107586' } },
      { filmLabel: { value: 'Yawar Mallku' }, tmdb: { value: '107584' } },
      { filmLabel: { value: 'Duplicate' }, tmdb: { value: '107586' } },
    ])

    expect(ids).toEqual([107584, 107586])
    expect(unresolvedTitles).toEqual([])
  })

  it('keeps labels without a TMDB id as unresolved titles', () => {
    const { ids, unresolvedTitles } = parseWikidataBindings([
      { filmLabel: { value: 'Una película sin ficha' } },
      { filmLabel: { value: '  Otra  ' } },
    ])

    expect(ids).toEqual([])
    expect(unresolvedTitles).toEqual(['Otra', 'Una película sin ficha'])
  })

  it('drops Q-ids used as labels and non-numeric TMDB values', () => {
    const { ids, unresolvedTitles } = parseWikidataBindings([
      { filmLabel: { value: 'Q12345' } },
      { filmLabel: { value: 'Keep me' }, tmdb: { value: 'not-a-number' } },
      { filmLabel: { value: 'Zero' }, tmdb: { value: '0' } },
    ])

    expect(ids).toEqual([])
    expect(unresolvedTitles).toEqual(['Keep me', 'Zero'])
  })
})
