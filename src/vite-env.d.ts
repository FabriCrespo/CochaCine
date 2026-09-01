/**
 * =============================================================================
 * TIPOS DE VITE (import.meta.env)
 * =============================================================================
 *
 * Este archivo NO genera JavaScript. Solo le enseña a TypeScript qué variables
 * existen en `import.meta.env`.
 *
 * `/// <reference types="vite/client" />` trae MODE, DEV, PROD, BASE_URL, etc.
 *
 * Cómo agregar una variable nueva:
 *   1. Ponla en `.env` con prefijo VITE_
 *   2. Declárala aquí dentro de ImportMetaEnv
 *   3. Léela y valídala en src/config/env.ts
 *
 * Si te saltas el paso 2, TypeScript se queja: "Property X does not exist".
 * Eso es bueno: te avisa ANTES de correr la app.
 */

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TMDB_TOKEN: string
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_ADMIN_PASSWORD?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
