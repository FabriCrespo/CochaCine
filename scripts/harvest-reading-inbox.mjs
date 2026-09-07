import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  featuredHrefsFromReadingsSource,
  parseCrossrefWorks,
  parseFeedItems,
  selectReadingInbox,
} from './readingInbox.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const USER_AGENT = 'Cochacine/1.0 (https://github.com/FabriCrespo/CochaCine; essential-reading research)'

const RSS_SOURCES = [
  { id: 'senses', kicker: 'Senses of Cinema', url: 'https://www.sensesofcinema.com/feed/' },
  { id: 'film-comment', kicker: 'Film Comment', url: 'https://www.filmcomment.com/feed/' },
  { id: 'revista', kicker: 'ReVista · Harvard', url: 'https://revista.drclas.harvard.edu/feed/' },
  { id: 'reverse-shot', kicker: 'Reverse Shot', url: 'https://reverseshot.org/feed' },
  { id: 'film-quarterly', kicker: 'Film Quarterly', url: 'https://filmquarterly.org/feed/' },
  { id: 'guardian-film', kicker: 'The Guardian Film', url: 'https://www.theguardian.com/film/rss' },
  { id: 'variety', kicker: 'Variety', url: 'https://variety.com/v/film/feed/' },
  { id: 'indiewire', kicker: 'IndieWire', url: 'https://www.indiewire.com/feed/' },
  { id: 'lwlies', kicker: 'Little White Lies', url: 'https://lwlies.com/feed/' },
  { id: 'hyperallergic', kicker: 'Hyperallergic', url: 'https://hyperallergic.com/feed/' },
]

const CROSSREF_QUERIES = [
  'Bolivian cinema',
  'Jorge Sanjinés',
  'Grupo Ukamau',
  'Bolivian film',
]

const featuredHrefs = featuredHrefsFromReadingsSource(
  readFileSync(join(root, 'src/config/readings.ts'), 'utf8'),
)

const reports = []
/** @type {Array<Record<string, string>>} */
const collected = []

for (const source of RSS_SOURCES) {
  const xml = await fetchText(source.url)
  if (!xml.ok) {
    reports.push({ id: source.id, kicker: source.kicker, ok: false, error: xml.error })
    continue
  }
  const items = parseFeedItems(xml.text, { sourceId: source.id, kicker: source.kicker })
  collected.push(...items)
  reports.push({ id: source.id, kicker: source.kicker, ok: true, found: items.length })
}

for (const query of CROSSREF_QUERIES) {
  const url =
    'https://api.crossref.org/works?' +
    new URLSearchParams({
      query,
      rows: '20',
      select: 'DOI,title,URL,container-title,abstract,issued,author',
    }).toString()
  const json = await fetchJson(url)
  if (!json.ok) {
    reports.push({ id: `crossref:${query}`, kicker: 'Crossref', ok: false, error: json.error })
    continue
  }
  const items = parseCrossrefWorks(json.data, { sourceId: 'crossref', kicker: 'Crossref' })
  collected.push(...items)
  reports.push({ id: `crossref:${query}`, kicker: 'Crossref', ok: true, found: items.length })
  await new Promise((resolve) => setTimeout(resolve, 800))
}

const items = selectReadingInbox(collected, featuredHrefs)
const payload = {
  harvestedAt: new Date().toISOString(),
  note: 'Candidates only. The home library stays curated in src/config/readings.ts. MUBI has no public RSS — search Notebook by hand.',
  alsoCheck: [
    'https://mubi.com/en/notebook (search Bolivia, Sanjinés, Ukamau)',
    'https://www.ejumpcut.org/',
    'https://cineaste.com/',
  ],
  sources: reports,
  items,
}

const dest = join(root, 'src/data/readingInbox.json')
writeFileSync(dest, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
console.log(`inbox=${items.length} sources=${reports.filter((row) => row.ok).length}/${reports.length}`)

if (process.env.READING_INBOX_ISSUE === '1' && process.env.GITHUB_TOKEN && process.env.GITHUB_REPOSITORY) {
  await openGithubIssue(payload)
}

/**
 * @param {string} url
 */
async function fetchText(url) {
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml', 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` }
    return { ok: true, text: await res.text() }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'fetch failed' }
  }
}

/**
 * @param {string} url
 */
async function fetchJson(url) {
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` }
    return { ok: true, data: await res.json() }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'fetch failed' }
  }
}

/**
 * @param {{ harvestedAt: string, items: Array<{ kicker: string, title: string, href: string, date: string, dek: string }>, alsoCheck: string[], sources: Array<{ id: string, ok: boolean, error?: string }> }} payload
 */
async function openGithubIssue(payload) {
  const lines = payload.items.map(
    (item) => `- **${item.kicker}** (${item.date || 'n.d.'}) — [${item.title}](${item.href})`,
  )
  const failed = payload.sources.filter((row) => !row.ok)
  const body = [
    `Harvest ${payload.harvestedAt.slice(0, 10)}. These are **suggestions** for Essential reading — not published.`,
    '',
    lines.length > 0 ? lines.join('\n') : '_Nothing matched Bolivia + cinema this month._',
    '',
    'Check by hand (no public RSS):',
    ...payload.alsoCheck.map((url) => `- ${url}`),
    failed.length > 0 ? `\nFeeds that failed: ${failed.map((row) => row.id).join(', ')}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const res = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/issues`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      'User-Agent': USER_AGENT,
    },
    body: JSON.stringify({
      title: `Library inbox · ${payload.harvestedAt.slice(0, 7)}`,
      body,
    }),
  })

  if (!res.ok) {
    console.error('GitHub issue', res.status, await res.text())
    process.exitCode = 1
    return
  }

  const issue = await res.json()
  console.log(`issue=${issue.html_url}`)
}
