/**
 * =============================================================================
 * VITE CONFIG
 * =============================================================================
 *
 * Configuración del bundler. En TypeScript Vite entiende este archivo
 * gracias a tsconfig.node.json.
 *
 * Plugins:
 *   - @vitejs/plugin-react  → JSX/TSX + Fast Refresh
 *   - @tailwindcss/vite     → Tailwind v4
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
