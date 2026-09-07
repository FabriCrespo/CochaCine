import inboxFile from '../../data/readingInbox.json' with { type: 'json' }
import type { ReadingInboxFile } from '../../data/readingInbox.ts'

const inbox = inboxFile as ReadingInboxFile

export function ReadingInbox() {
  const items = inbox.items
  const harvested = inbox.harvestedAt?.slice(0, 10) ?? 'never'

  return (
    <section className="border-t border-ivory/8 px-5 py-4">
      <p className="text-[10px] tracking-[0.2em] uppercase text-muted">Library inbox</p>
      <p className="mt-1 font-serif text-xs text-ivory/45">Harvest {harvested}. Not on the home.</p>
      {items.length === 0 ? (
        <p className="mt-3 font-serif text-sm leading-6 text-ivory/50">
          Empty. Run <span className="text-ivory">npm run harvest:readings</span>, then pick a title
          for <span className="text-ivory">src/config/readings.ts</span>.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.slice(0, 12).map((item) => (
            <li key={`${item.sourceId}-${item.href}`}>
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer noopener"
                className="block font-serif text-sm leading-5 text-ivory/80 hover:text-brand"
              >
                {item.title}
              </a>
              <p className="mt-0.5 text-[10px] tracking-[0.14em] uppercase text-muted">
                {item.kicker}
                {item.date ? ` · ${item.date.slice(0, 4)}` : ''}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
