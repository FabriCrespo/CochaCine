import { describe, expect, it } from 'vitest'
import { parseWatchlist } from './watchlist.ts'

describe('parseWatchlist', () => {
  it('reads saved titles from objects', () => {
    const items = parseWatchlist(
      JSON.stringify([
        { id: 107586, title: 'A Matter of Faith', posterUrl: '/p.jpg', releaseYear: '1995' },
      ]),
    )
    expect(items).toEqual([
      { id: 107586, title: 'A Matter of Faith', posterUrl: '/p.jpg', releaseYear: '1995' },
    ])
  })

  it('accepts a legacy list of numeric ids', () => {
    expect(parseWatchlist('[107584, 0, "x"]')).toEqual([
      { id: 107584, title: 'Title 107584', posterUrl: null, releaseYear: null },
    ])
  })

  it('returns empty on junk', () => {
    expect(parseWatchlist('{')).toEqual([])
    expect(parseWatchlist('null')).toEqual([])
  })
})
