import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AppError } from '../../api/http/errors.ts'
import {
  fetchCatalogHouse,
  hideCatalogMovie,
  moveCatalogBeloved,
  pinCatalogBeloved,
  unhideCatalogMovie,
  unpinCatalogBeloved,
  type CatalogHouse,
} from '../../api/supabase/catalogHouse.api.ts'
import { houseKeys, movieKeys } from '../keys.ts'

export function useCatalogHouse() {
  return useQuery<CatalogHouse, AppError>({
    queryKey: houseKeys.state(),
    queryFn: fetchCatalogHouse,
  })
}

export function useHideCatalogMovie() {
  return useHouseMutation(hideCatalogMovie)
}

export function useUnhideCatalogMovie() {
  return useHouseMutation(unhideCatalogMovie)
}

export function usePinCatalogBeloved() {
  return useHouseMutation(pinCatalogBeloved)
}

export function useUnpinCatalogBeloved() {
  return useHouseMutation(unpinCatalogBeloved)
}

export function useMoveCatalogBeloved() {
  const queryClient = useQueryClient()

  return useMutation<CatalogHouse, AppError, { tmdbId: number; direction: -1 | 1 }>({
    mutationFn: ({ tmdbId, direction }) => moveCatalogBeloved(tmdbId, direction),
    onSuccess: (house) => applyHouse(queryClient, house),
  })
}

function useHouseMutation(fn: (tmdbId: number) => Promise<CatalogHouse>) {
  const queryClient = useQueryClient()

  return useMutation<CatalogHouse, AppError, number>({
    mutationFn: fn,
    onSuccess: (house) => applyHouse(queryClient, house),
  })
}

function applyHouse(
  queryClient: ReturnType<typeof useQueryClient>,
  house: CatalogHouse,
) {
  queryClient.setQueryData(houseKeys.state(), house)
  void queryClient.invalidateQueries({ queryKey: movieKeys.lists() })
  void queryClient.refetchQueries({ queryKey: movieKeys.bolivian(false) })
  void queryClient.refetchQueries({ queryKey: movieKeys.bolivian(true) })
}
