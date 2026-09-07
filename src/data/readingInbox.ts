/**
 * Candidatos a Essential reading. No se publican solos.
 * Regenerar: npm run harvest:readings
 */

export type ReadingInboxItem = {
  id: string
  sourceId: string
  kicker: string
  title: string
  dek: string
  href: string
  date: string
  kind: string
}

export type ReadingInboxFile = {
  harvestedAt: string | null
  note?: string
  alsoCheck?: string[]
  sources: Array<{ id: string; kicker?: string; ok: boolean; error?: string; found?: number }>
  items: ReadingInboxItem[]
}
