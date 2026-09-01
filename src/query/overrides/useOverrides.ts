import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteMovieOverride,
  fetchAllMovieOverrides,
  fetchMovieOverride,
  uploadMoviePoster,
  upsertMovieOverride,
} from '../../api/supabase/overrides.api.ts'
import type { AppError } from '../../api/http/errors.ts'
import type { MovieOverride, MovieOverrideWrite } from '../../api/supabase/types.ts'
import { movieKeys, overrideKeys } from '../keys.ts'

export function useOverrideList() {
  return useQuery<MovieOverride[], AppError>({
    queryKey: overrideKeys.list(),
    queryFn: fetchAllMovieOverrides,
  })
}

export function useMovieOverride(id: number) {
  const queryClient = useQueryClient()

  return useQuery<MovieOverride | null, AppError>({
    queryKey: overrideKeys.detail(id),
    queryFn: () => fetchMovieOverride(id),
    enabled: id > 0,
    placeholderData: () => {
      const list = queryClient.getQueryData<MovieOverride[]>(overrideKeys.list())
      return list?.find((row) => row.tmdb_id === id) ?? undefined
    },
  })
}

function invalidateEditorial(queryClient: ReturnType<typeof useQueryClient>, tmdbId: number) {
  void queryClient.invalidateQueries({ queryKey: overrideKeys.all })
  void queryClient.invalidateQueries({ queryKey: movieKeys.all })
  void queryClient.invalidateQueries({ queryKey: overrideKeys.detail(tmdbId) })
  void queryClient.invalidateQueries({ queryKey: movieKeys.detail(tmdbId) })
}

export function useSaveOverride() {
  const queryClient = useQueryClient()

  return useMutation<MovieOverride, AppError, MovieOverrideWrite>({
    mutationFn: upsertMovieOverride,
    onSuccess: (row) => {
      invalidateEditorial(queryClient, row.tmdb_id)
    },
  })
}

export function useDeleteOverride() {
  const queryClient = useQueryClient()

  return useMutation<void, AppError, number>({
    mutationFn: deleteMovieOverride,
    onSuccess: (_void, tmdbId) => {
      invalidateEditorial(queryClient, tmdbId)
    },
  })
}

export function useUploadPoster() {
  return useMutation<string, AppError, { tmdbId: number; file: File }>({
    mutationFn: ({ tmdbId, file }) => uploadMoviePoster(tmdbId, file),
  })
}
