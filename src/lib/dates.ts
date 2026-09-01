/**
 * =============================================================================
 * FECHAS (date-fns)
 * =============================================================================
 *
 * Un solo lugar para formatear fechas. Mañana, cuando tengas funciones de cine,
 * agrupas por día y muestras "Hoy 21:30" desde aquí — no desde cada componente
 * con `new Date().toLocaleString()` (eso cambia según el navegador).
 *
 * Zona de Bolivia: America/La_Paz (UTC-4, sin DST).
 */

import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'

export function formatTodayLong(date: Date = new Date()): string {
  return format(date, 'EEEE, MMMM d', { locale: enUS })
}

/** 128 min → "2 h 8 min". Sin horas: "45 min". */
export function formatRuntimeMinutes(minutes: number | null): string | null {
  if (minutes == null || minutes <= 0) return null
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} min`
  if (rest === 0) return `${hours} h`
  return `${hours} h ${rest} min`
}

/** 98 min → "1h 38m". */
export function formatRuntimeCompact(minutes: number | null): string | null {
  if (minutes == null || minutes <= 0) return null
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest}m`
  if (rest === 0) return `${hours}h`
  return `${hours}h ${rest}m`
}

/** 2024-03-07 → "March 7, 2024". */
export function formatReleaseDateLong(isoDate: string | null): string | null {
  if (!isoDate) return null
  const [year, month, day] = isoDate.split('-').map(Number)
  if (!year || !month || !day) return isoDate
  return format(new Date(year, month - 1, day), 'MMMM d, yyyy', {
    locale: enUS,
  })
}
