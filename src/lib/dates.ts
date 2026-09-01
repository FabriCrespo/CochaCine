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
