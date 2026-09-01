/**
 * Aplica el SQL editorial en el proyecto y deja las keys en .env.
 * No imprime secretos.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const envPath = join(root, '.env')
const sqlPath = join(root, 'supabase/migrations/20260829_movie_overrides.sql')

const PROJECT_REF = 'uiziibnbetcfaqsbknjb'
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`
const SECRET = process.env.SUPABASE_SECRET_KEY ?? ''

if (!SECRET.startsWith('sb_secret_')) {
  console.error('Falta SUPABASE_SECRET_KEY en el entorno.')
  process.exit(1)
}

function upsertEnv(key, value) {
  if (!value) return
  let text = readFileSync(envPath, 'utf8')
  const line = `${key}=${value}`
  const pattern = new RegExp(`^${key}=.*$`, 'm')
  if (pattern.test(text)) {
    text = text.replace(pattern, line)
  } else {
    text = `${text.trimEnd()}\n${line}\n`
  }
  writeFileSync(envPath, text, 'utf8')
}

async function request(url, init = {}) {
  const headers = {
    apikey: SECRET,
    Authorization: `Bearer ${SECRET}`,
    'Content-Type': 'application/json',
    ...(init.headers ?? {}),
  }
  const res = await fetch(url, { ...init, headers })
  const body = await res.text()
  return { ok: res.ok, status: res.status, body }
}

upsertEnv('SUPABASE_URL', SUPABASE_URL)
upsertEnv('VITE_SUPABASE_URL', SUPABASE_URL)
upsertEnv('SUPABASE_SECRET_KEY', SECRET)

const sql = readFileSync(sqlPath, 'utf8')

const attempts = [
  {
    name: 'platform-query',
    url: `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    init: { method: 'POST', body: JSON.stringify({ query: sql }) },
  },
  {
    name: 'pg-query',
    url: `${SUPABASE_URL}/pg/query`,
    init: { method: 'POST', body: JSON.stringify({ query: sql }) },
  },
]

let applied = false
for (const attempt of attempts) {
  const result = await request(attempt.url, attempt.init)
  console.log(`SQL ${attempt.name}: HTTP ${result.status}`)
  if (result.ok) {
    applied = true
    break
  }
}

const bucket = await request(`${SUPABASE_URL}/storage/v1/bucket`, {
  method: 'POST',
  body: JSON.stringify({
    id: 'movie-media',
    name: 'movie-media',
    public: true,
    file_size_limit: 5_000_000,
    allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp'],
  }),
})
console.log(`Storage bucket: HTTP ${bucket.status}`)

const keyEndpoints = [
  `https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys?reveal=true`,
  `https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys`,
]

let publishable = ''
let anonJwt = ''
for (const url of keyEndpoints) {
  const result = await request(url)
  console.log(`API keys: HTTP ${result.status}`)
  if (!result.ok) continue
  try {
    const parsed = JSON.parse(result.body)
    const list = Array.isArray(parsed) ? parsed : parsed.keys ?? parsed.api_keys ?? []
    for (const item of list) {
      const name = String(item.name ?? item.type ?? item.api_key_type ?? '')
      const value = String(item.api_key ?? item.key ?? item.secret ?? '')
      if (!value) continue
      if (value.startsWith('sb_publishable_') || /publishable|anon/i.test(name)) {
        if (value.startsWith('sb_publishable_')) publishable = value
        else if (value.startsWith('eyJ')) anonJwt = value
      }
    }
  } catch {
    // ignore
  }
}

if (publishable) upsertEnv('VITE_SUPABASE_PUBLISHABLE_KEY', publishable)
if (anonJwt) upsertEnv('VITE_SUPABASE_ANON_KEY', anonJwt)

console.log(JSON.stringify({
  applied,
  hasPublishable: Boolean(publishable),
  hasAnonJwt: Boolean(anonJwt),
}))
