/**
 * =============================================================================
 * VARIABLES DE ENTORNO (env)
 * =============================================================================
 *
 * Vite inyecta las variables VITE_* en `import.meta.env`.
 * Si las leemos sueltas en cada archivo, un typo rompe la app en runtime.
 *
 * Este módulo es la ÚNICA puerta de entrada. El resto importa `env`.
 *
 * Cómo se usa:
 *   import { env } from '../config/env'
 *   env.tmdbToken
 *
 * Cómo agregar otra variable:
 *   1. Añádela a `.env` con prefijo VITE_
 *   2. Declárala en src/vite-env.d.ts (ImportMetaEnv)
 *   3. Léela aquí con requiredEnv('VITE_LO_QUE_SEA') o optionalEnv
 *
 * Importante:
 *   Todo VITE_* viaja al navegador. El token de TMDB es de solo lectura.
 *   El sb_secret de Supabase NO lleva prefijo VITE_.
 */

type EnvName = keyof ImportMetaEnv

function requiredEnv(name: EnvName): string {
  const value = import.meta.env[name]

  if (!value) {
    throw new Error(
      `Falta la variable ${name} en el archivo .env. ` +
        `Cópiala desde .env.example y completa el valor.`,
    )
  }

  return value
}

function optionalEnv(name: EnvName): string | null {
  const value = import.meta.env[name]
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export const env = {
  tmdbToken: requiredEnv('VITE_TMDB_TOKEN'),
  supabaseUrl: optionalEnv('VITE_SUPABASE_URL'),
  supabasePublishableKey:
    optionalEnv('VITE_SUPABASE_PUBLISHABLE_KEY') ??
    optionalEnv('VITE_SUPABASE_ANON_KEY'),
  adminPassword: optionalEnv('VITE_ADMIN_PASSWORD') ?? 'szactrl123C!n',
  isDev: import.meta.env.DEV,
} as const
