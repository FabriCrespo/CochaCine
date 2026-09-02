export const PAGE_SIZE = 10

export type PageSlice<T> = {
  items: T[]
  page: number
  totalPages: number
  total: number
  from: number
  to: number
}

export function paginate<T>(items: T[], page: number, size = PAGE_SIZE): PageSlice<T> {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / size))
  const current = Math.min(Math.max(1, page), totalPages)
  const start = (current - 1) * size
  return {
    items: items.slice(start, start + size),
    page: current,
    totalPages,
    total,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + size, total),
  }
}
