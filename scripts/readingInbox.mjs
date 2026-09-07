/**
 * Inbox de Essential reading: parseo de RSS/Atom + Crossref, filtro Bolivia/cine.
 * El harvest solo hace fetch y escribe el JSON. La home no lee este archivo.
 */

const CINEMA_WORD =
  /\b(cinema|cinematic|film|films|filmmaker|filmmakers|director|directors|movie|movies|notebook|festival|cineaste)\b/i

const BOLIVIA_PLACE = /\bbolivia(?:n)?\b/i

const BOLIVIA_NAMES =
  /\bsanjin[eé]s\b|\bgrupo ukamau\b|\byawar mallku\b|\bblood of the condor\b|\bcinemateca boliviana\b|\bjorge ruiz\b|\bmarcos loayza\b|\balejandro loayza\b|\bla hija c[oó]ndor\b|\bcuesti[oó]n de fe\b|\bnaci[oó]n clandestina\b/i

/**
 * @param {string} text
 */
export function isBolivianCinemaText(text) {
  const hay = foldText(text)
  if (!hay) return false
  if (BOLIVIA_NAMES.test(hay)) return true
  return BOLIVIA_PLACE.test(hay) && CINEMA_WORD.test(hay)
}

/**
 * @param {string} xml
 * @param {{ kicker: string, sourceId: string }} source
 */
export function parseFeedItems(xml, source) {
  const blocks = [
    ...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi),
    ...xml.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/gi),
  ]

  return blocks
    .map((match) => itemFromBlock(match[1], source))
    .filter((item) => item != null)
}

/**
 * @param {unknown} payload
 * @param {{ kicker: string, sourceId: string }} source
 */
export function parseCrossrefWorks(payload, source) {
  const message = payload && typeof payload === 'object' ? /** @type {{ message?: { items?: unknown[] } }} */ (payload).message : null
  const items = Array.isArray(message?.items) ? message.items : []

  return items
    .map((row) => workFromCrossref(row, source))
    .filter((item) => item != null)
}

/**
 * @param {Array<Record<string, string>>} items
 * @param {string[]} featuredHrefs
 * @param {number} [limit]
 */
export function selectReadingInbox(items, featuredHrefs, limit = 40) {
  const featured = new Set(featuredHrefs.map(normalizeHref))
  const seen = new Set()
  const kept = []

  const ranked = [...items].sort((left, right) => (right.date || '').localeCompare(left.date || ''))

  for (const item of ranked) {
    const href = normalizeHref(item.href)
    if (!href || featured.has(href) || seen.has(href)) continue
    if (!isBolivianCinemaText(`${item.title} ${item.dek}`)) continue
    seen.add(href)
    kept.push({ ...item, href })
    if (kept.length >= limit) break
  }

  return kept
}

/**
 * @param {string} source
 */
export function featuredHrefsFromReadingsSource(source) {
  return [...source.matchAll(/href:\s*'([^']+)'/g)].map((match) => match[1])
}

function itemFromBlock(block, source) {
  const title = firstTag(block, 'title')
  const href = itemLink(block)
  if (!title || !href) return null

  const dek = firstTag(block, 'description') || firstTag(block, 'summary') || firstTag(block, 'content') || ''
  const date =
    firstTag(block, 'pubDate') ||
    firstTag(block, 'published') ||
    firstTag(block, 'updated') ||
    firstTag(block, 'dc:date') ||
    ''

  return {
    id: slugFromHref(href),
    sourceId: source.sourceId,
    kicker: source.kicker,
    title: collapse(title),
    dek: collapse(stripTags(dek)).slice(0, 280),
    href,
    date: toIsoDate(date),
    kind: 'rss',
  }
}

function workFromCrossref(row, source) {
  if (!row || typeof row !== 'object') return null
  const work = /** @type {Record<string, unknown>} */ (row)
  const titles = Array.isArray(work.title) ? work.title : []
  const title = typeof titles[0] === 'string' ? titles[0] : ''
  const href =
    (typeof work.URL === 'string' && work.URL) ||
    (typeof work.DOI === 'string' ? `https://doi.org/${work.DOI}` : '')
  if (!title || !href) return null

  const container = Array.isArray(work['container-title']) ? work['container-title'][0] : ''
  const abstract = typeof work.abstract === 'string' ? stripTags(work.abstract) : ''
  const authors = Array.isArray(work.author)
    ? work.author
        .map((person) => {
          if (!person || typeof person !== 'object') return ''
          const row = /** @type {{ given?: string, family?: string, name?: string }} */ (person)
          if (row.name) return row.name
          return [row.given, row.family].filter(Boolean).join(' ')
        })
        .filter(Boolean)
        .join(', ')
    : ''
  const dek = collapse([container, authors, abstract].filter(Boolean).join(' — ')).slice(0, 280)
  const issued = work.issued && typeof work.issued === 'object' ? /** @type {{ 'date-parts'?: number[][] }} */ (work.issued)['date-parts'] : null
  const parts = Array.isArray(issued) && Array.isArray(issued[0]) ? issued[0] : []
  const year = Number(parts[0])
  const date = Number.isFinite(year)
    ? `${year}-${String(parts[1] ?? 1).padStart(2, '0')}-${String(parts[2] ?? 1).padStart(2, '0')}`
    : ''

  return {
    id: slugFromHref(href),
    sourceId: source.sourceId,
    kicker: typeof container === 'string' && container ? String(container) : source.kicker,
    title: collapse(title),
    dek,
    href,
    date,
    kind: 'crossref',
  }
}

function itemLink(block) {
  const atom = block.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*\/?>/i)
  if (atom?.[1]) return atom[1].trim()
  const guid = firstTag(block, 'guid')
  if (guid && /^https?:\/\//i.test(guid)) return guid
  const link = firstTag(block, 'link')
  return link && /^https?:\/\//i.test(link) ? link : ''
}

function firstTag(block, name) {
  const cdata = block.match(new RegExp(`<${name}\\b[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]>`, 'i'))
  if (cdata?.[1]) return decodeEntities(cdata[1].trim())
  const plain = block.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, 'i'))
  if (plain?.[1]) return decodeEntities(stripTags(plain[1]).trim())
  return ''
}

function stripTags(value) {
  return value.replace(/<[^>]+>/g, ' ')
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
}

function collapse(value) {
  return value.replace(/\s+/g, ' ').trim()
}

function foldText(value) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

function normalizeHref(href) {
  try {
    const url = new URL(href)
    url.hash = ''
    let path = url.pathname.replace(/\/+$/, '')
    if (path === '') path = '/'
    return `${url.origin}${path}`.toLowerCase()
  } catch {
    return href.trim().replace(/\/+$/, '').toLowerCase()
  }
}

function slugFromHref(href) {
  try {
    const url = new URL(href)
    const path = url.pathname.replace(/\/+$/, '').split('/').filter(Boolean).pop() ?? 'item'
    return `${url.hostname.replace(/^www\./, '')}-${path}`.slice(0, 80)
  } catch {
    return href.slice(-80)
  }
}

function toIsoDate(raw) {
  if (!raw) return ''
  const parsed = Date.parse(raw)
  if (Number.isNaN(parsed)) return raw.slice(0, 10)
  return new Date(parsed).toISOString().slice(0, 10)
}
