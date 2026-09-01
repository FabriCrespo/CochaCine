/**
 * Cliente de Supabase (solo lectura pública).
 * El sb_secret NUNCA va acá: viaja al navegador si tiene prefijo VITE_.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env } from '../../config/env.ts'

let client: SupabaseClient | null | undefined

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client
  if (!env.supabaseUrl || !env.supabasePublishableKey) {
    client = null
    return client
  }
  client = createClient(env.supabaseUrl, env.supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return client
}
