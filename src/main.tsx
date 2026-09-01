/**
 * =============================================================================
 * PUNTO DE ENTRADA
 * =============================================================================
 *
 * Orden de envoltorios (de afuera hacia adentro):
 *   StrictMode                 → detecta efectos dobles en desarrollo
 *   PersistQueryClientProvider → React Query + cache en localStorage
 *   BrowserRouter              → React Router lee la URL
 *   App                        → <Routes>
 *   ReactQueryDevtools         → panel para inspeccionar queries (solo DEV)
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { env } from './config/env.ts'
import { queryClient, queryPersistOptions } from './query/queryClient.ts'
import App from './App.tsx'
import './index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Could not find #root in index.html')
}

createRoot(rootElement).render(
  <StrictMode>
    <PersistQueryClientProvider client={queryClient} persistOptions={queryPersistOptions}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      {env.isDev ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </PersistQueryClientProvider>
  </StrictMode>,
)
