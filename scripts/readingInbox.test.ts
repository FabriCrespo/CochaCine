import { describe, expect, it } from 'vitest'
import {
  featuredHrefsFromReadingsSource,
  isBolivianCinemaText,
  parseCrossrefWorks,
  parseFeedItems,
  selectReadingInbox,
} from './readingInbox.mjs'

const source = { sourceId: 'senses', kicker: 'Senses of Cinema' }

describe('isBolivianCinemaText', () => {
  it('keeps a named Bolivian filmmaker even without the word Bolivia', () => {
    expect(isBolivianCinemaText('Jorge Sanjinés and the Grupo Ukamau')).toBe(true)
  })

  it('needs a cinema word when the only hit is Bolivia', () => {
    expect(isBolivianCinemaText('Lithium mining in Bolivia')).toBe(false)
    expect(isBolivianCinemaText('A new Bolivian film at Berlinale')).toBe(true)
    expect(isBolivianCinemaText('Comunidad Ukamau: vivienda social')).toBe(false)
  })
})

describe('parseFeedItems', () => {
  it('reads RSS items and Atom links', () => {
    const xml = `
      <rss><channel>
        <item>
          <title>The Grupo Ukamau</title>
          <link>https://mubi.com/en/notebook/posts/notebook-primer-the-grupo-ukamau</link>
          <description><![CDATA[<p>Indigenous cinema in Bolivia.</p>]]></description>
          <pubDate>Mon, 03 Mar 2025 12:00:00 GMT</pubDate>
        </item>
      </channel></rss>
      <feed>
        <entry>
          <title>Other</title>
          <link href="https://example.com/a" />
          <updated>2024-01-02T00:00:00Z</updated>
        </entry>
      </feed>
    `
    const items = parseFeedItems(xml, source)
    expect(items[0]?.title).toBe('The Grupo Ukamau')
    expect(items[0]?.date).toBe('2025-03-03')
    expect(items[1]?.href).toBe('https://example.com/a')
  })
})

describe('selectReadingInbox', () => {
  it('drops featured URLs and non-cinema Bolivia hits', () => {
    const featured = ['https://mubi.com/en/notebook/posts/notebook-primer-the-grupo-ukamau/']
    const kept = selectReadingInbox(
      [
        {
          id: 'a',
          sourceId: 'mubi',
          kicker: 'MUBI',
          title: 'The Grupo Ukamau',
          dek: 'Indigenous cinema in Bolivia.',
          href: 'https://mubi.com/en/notebook/posts/notebook-primer-the-grupo-ukamau',
          date: '2025-03-03',
          kind: 'rss',
        },
        {
          id: 'b',
          sourceId: 'variety',
          kicker: 'Variety',
          title: 'Lithium in Bolivia',
          dek: 'Mining news.',
          href: 'https://variety.com/lithium',
          date: '2026-01-01',
          kind: 'rss',
        },
        {
          id: 'c',
          sourceId: 'senses',
          kicker: 'Senses of Cinema',
          title: 'A Bolivian film returns',
          dek: 'Festival notes.',
          href: 'https://www.sensesofcinema.com/bolivia-returns/',
          date: '2026-02-01',
          kind: 'rss',
        },
      ],
      featured,
    )

    expect(kept).toHaveLength(1)
    expect(kept[0]?.href).toBe('https://www.sensesofcinema.com/bolivia-returns')
  })
})

describe('parseCrossrefWorks', () => {
  it('maps a journal article to an inbox row', () => {
    const [item] = parseCrossrefWorks(
      {
        message: {
          items: [
            {
              title: ['The cinema of Jorge Sanjinés'],
              URL: 'https://doi.org/10.0000/sanjines',
              'container-title': ['Jump Cut'],
              abstract: '<p>Ukamau and after.</p>',
              author: [{ given: 'Jorge', family: 'Sanjinés' }],
              issued: { 'date-parts': [[2021, 6]] },
            },
          ],
        },
      },
      { sourceId: 'crossref', kicker: 'Crossref' },
    )

    expect(item?.title).toBe('The cinema of Jorge Sanjinés')
    expect(item?.kicker).toBe('Jump Cut')
    expect(item?.date).toBe('2021-06-01')
    expect(item?.dek).toContain('Jorge Sanjinés')
  })
})

describe('featuredHrefsFromReadingsSource', () => {
  it('reads hrefs from the readings module', () => {
    const hrefs = featuredHrefsFromReadingsSource(`href: 'https://example.com/a',\nhref: 'https://example.com/b',`)
    expect(hrefs).toEqual(['https://example.com/a', 'https://example.com/b'])
  })
})
