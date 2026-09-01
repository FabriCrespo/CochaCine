/**
 * =============================================================================
 * QUERY CLIENT (cerebro del cache de React Query)
 * =============================================================================
 *
 * Una sola instancia, compartida por toda la app vía PersistQueryClientProvider.
 * El catálogo y los géneros se guardan en localStorage para no volver a pedir
 * TMDB al volver de una ficha o al recargar.
 */

import { QueryClient } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const DAY_MS = 24 * 60 * 60 * 1000

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: DAY_MS,
      gcTime: DAY_MS,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
  },
})

export const queryPersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'cochacine.query',
})

export const queryPersistOptions = {
  persister: queryPersister,
  maxAge: DAY_MS,
} as const
