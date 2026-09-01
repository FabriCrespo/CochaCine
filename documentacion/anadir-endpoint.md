# Cómo añadir un endpoint nuevo

Sigue **estos 8 pasos en este orden**. No saltes al componente primero: si el tipo y el `fetch` no existen, TypeScript no te va a dejar pintar nada, y eso está bien.

El ejemplo de esta guía es el siguiente endpoint de TMDB (el más natural después de populares):

```
GET /movie/{id}
```

Documentación oficial: [Movie Details](https://developer.themoviedb.org/reference/movie-details).

Al final tendrás:

- `fetchMovieById(id)`
- `useMovie(id)`
- una página `MovieDetailPage`

El patrón es el mismo para `/movie/now_playing`, `/search/movie`, `/tv/popular`, etc. Solo cambian nombres y tipos.

---

## Paso 0 — Antes de codear

1. Abre la doc de TMDB y mira el JSON de ejemplo.
2. Anota **solo los campos que vas a mostrar**. El resto se puede omitir en el DTO.
3. Decide el nombre:
   - DTO: `TmdbMovieDetailDto`
   - Dominio: `MovieDetail`
   - Fetch: `fetchMovieById`
   - Hook: `useMovie`
   - Key: `movieKeys.detail(id)`

---

## Paso 1 — Registrar la URL

Archivo: `src/api/tmdb/endpoints.ts`

Añade el path. Si lleva un id, usa una función.

```ts
export const TMDB_ENDPOINTS = {
  movies: {
    popular: '/movie/popular',
    detail: (id: number) => `/movie/${id}`,
  },
} as const
```

No pongas `https://api.themoviedb.org/3` aquí. Eso ya está en `axiosClient` (`baseURL`).

---

## Paso 2 — Tipar el JSON crudo (DTO)

Archivo: `src/api/tmdb/tmdb.types.ts`

Copia la forma de TMDB (snake_case). Puedes reutilizar el listado y extenderlo.

```ts
export type TmdbMovieDetailDto = TmdbMovieListItemDto & {
  runtime: number | null
  genres: Array<{ id: number; name: string }>
  tagline: string
}
```

Este tipo **no sale** de `api/tmdb/`. La UI no lo importa.

---

## Paso 3 — Tipar el modelo de la app (dominio)

Archivo: `src/domain/movie.ts`

Nombres en el idioma de tu UI, no de TMDB.

```ts
export type MovieDetail = Movie & {
  runtime: number | null
  genres: string[]
  tagline: string
}
```

`Movie & { ... }` reutiliza `id`, `title`, `rating`, `posterUrl`, etc.

---

## Paso 4 — Mapear DTO → dominio

Archivo: `src/api/tmdb/mappers.ts`

```ts
import type { MovieDetail } from '../../domain/movie.ts'
import type { TmdbMovieDetailDto } from './tmdb.types.ts'

export function mapMovieDetail(dto: TmdbMovieDetailDto): MovieDetail {
  return {
    ...mapMovie(dto),
    runtime: dto.runtime,
    genres: dto.genres.map((genre) => genre.name),
    tagline: dto.tagline,
  }
}
```

Aquí es donde `vote_average` se convierte en `rating` (vía `mapMovie`) y `genres: [{ name }]` se convierte en `string[]`.

---

## Paso 5 — Función de API (Axios, sin React)

Archivo: `src/api/tmdb/movies.api.ts`

El genérico de `get<>` es el **DTO**. El `return` es el **dominio**.

```ts
import type { MovieDetail } from '../../domain/movie.ts'
import type { TmdbMovieDetailDto } from './tmdb.types.ts'
import { mapMovieDetail } from './mappers.ts'

export async function fetchMovieById(id: number): Promise<MovieDetail> {
  const { data } = await axiosClient.get<TmdbMovieDetailDto>(
    TMDB_ENDPOINTS.movies.detail(id),
    {
      params: { language: DEFAULT_LANGUAGE },
    },
  )

  return mapMovieDetail(data)
}
```

Checklist de este archivo:

- [ ] No hay `useQuery` ni JSX
- [ ] El path sale de `TMDB_ENDPOINTS`
- [ ] Devuelves el mapper, no `data` crudo

---

## Paso 6 — Query key

Archivo: `src/query/keys.ts`

La key tiene que incluir **todo lo que cambia el resultado**. Aquí, el `id`.

```ts
export const movieKeys = {
  all: ['movies'] as const,
  lists: () => [...movieKeys.all, 'list'] as const,
  popular: (page = 1) => [...movieKeys.lists(), 'popular', { page }] as const,
  detail: (id: number) => [...movieKeys.all, 'detail', id] as const,
}
```

Así, película 550 y película 13 no pisan el cache. Si más adelante invalidas `movieKeys.all`, se refrescan listados **y** detalles.

---

## Paso 7 — Hook de React Query

Archivo nuevo: `src/query/movies/useMovie.ts`

```ts
import { useQuery } from '@tanstack/react-query'
import { fetchMovieById } from '../../api/tmdb/movies.api.ts'
import type { AppError } from '../../api/http/errors.ts'
import type { MovieDetail } from '../../domain/movie.ts'
import { movieKeys } from '../keys.ts'

export function useMovie(id: number) {
  return useQuery<MovieDetail, AppError>({
    queryKey: movieKeys.detail(id),
    queryFn: () => fetchMovieById(id),
    enabled: id > 0,
  })
}
```

`enabled: id > 0` evita disparar la petición si todavía no hay id (ruta vacía, parseo, etc.).

Los genéricos:

- `MovieDetail` → tipo de `data`
- `AppError` → tipo de `error`

---

## Paso 8 — Página (solo habla con el hook)

Archivo nuevo: `src/features/movies/MovieDetailPage.tsx`

```tsx
import { AppShell } from '../../components/layout/AppShell.tsx'
import { QueryState } from '../../components/feedback/QueryState.tsx'
import { useMovie } from '../../query/movies/useMovie.ts'

type MovieDetailPageProps = {
  movieId: number
}

export function MovieDetailPage({ movieId }: MovieDetailPageProps) {
  const { data, isPending, isError, error, refetch } = useMovie(movieId)

  return (
    <AppShell title={data?.title ?? 'Detalle'}>
      <QueryState
        isPending={isPending}
        isError={isError}
        error={error}
        onRetry={() => {
          void refetch()
        }}
      >
        {data ? (
          <article>
            <p className="text-zinc-400">{data.tagline}</p>
            <p className="mt-2">{data.overview}</p>
            <p className="mt-4 text-sm text-amber-400">
              {data.rating.toFixed(1)} · {data.genres.join(', ')}
            </p>
          </article>
        ) : null}
      </QueryState>
    </AppShell>
  )
}
```

Luego móntala desde `App.tsx` (o desde un router, cuando lo tengas):

```tsx
import { MovieDetailPage } from './features/movies/MovieDetailPage.tsx'

export default function App() {
  return <MovieDetailPage movieId={550} />
}
```

`550` es Fight Club, útil para probar. Después el id saldrá de la URL.

---

## Lista de archivos tocados

En este ejemplo, en orden:

1. `src/api/tmdb/endpoints.ts`
2. `src/api/tmdb/tmdb.types.ts`
3. `src/domain/movie.ts`
4. `src/api/tmdb/mappers.ts`
5. `src/api/tmdb/movies.api.ts`
6. `src/query/keys.ts`
7. `src/query/movies/useMovie.ts` *(nuevo)*
8. `src/features/movies/MovieDetailPage.tsx` *(nuevo)*
9. `src/App.tsx` *(solo para enganchar la página)*

No hace falta tocar `axiosClient.ts`, `errors.ts`, `queryClient.ts` ni `env.ts`. Ya sirven para cualquier GET de TMDB.

---

## Variante: otro listado (now playing, top rated, search)

Si el JSON es **igual** que populares (`page`, `results`, `total_pages`), reutilizas tipos y mappers:

```ts
// endpoints.ts
nowPlaying: '/movie/now_playing',

// movies.api.ts
export async function fetchNowPlayingMovies({ page = 1 } = {}): Promise<PopularMoviesPage> {
  const { data } = await axiosClient.get<TmdbPopularMoviesDto>(
    TMDB_ENDPOINTS.movies.nowPlaying,
    { params: { page, language: DEFAULT_LANGUAGE } },
  )
  return mapPopularMoviesPage(data)
}

// keys.ts
nowPlaying: (page = 1) => [...movieKeys.lists(), 'nowPlaying', { page }] as const

// query/movies/useNowPlayingMovies.ts
useQuery<PopularMoviesPage, AppError>({
  queryKey: movieKeys.nowPlaying(page),
  queryFn: () => fetchNowPlayingMovies({ page }),
})
```

La `MovieGrid` se reutiliza tal cual: recibe `Movie[]`, no le importa de qué endpoint salieron.

---

## Variante: un dominio nuevo (series, personas)

No metas `TvShow` dentro de `movie.ts`. Crea paralelo:

```
src/domain/tv.ts
src/api/tmdb/tv.api.ts
src/query/tv/usePopularTv.ts
src/features/tv/
```

Y un `tvKeys` en `query/keys.ts` (o `query/tvKeys.ts`) que empiece por `['tv']`, no por `['movies']`.

---

## Variante: otra API distinta de TMDB

Si el servicio **no es TMDB**, no reutilices `axiosClient` (ese cliente ya tiene `baseURL` y Bearer de TMDB).

Crea paralelo:

- otro cliente Axios (`api/http/...Client.ts`) con su `baseURL` y su auth
- carpeta `api/<servicio>/` (endpoints, DTOs, mappers, fetch)
- dominio propio
- query keys que empiecen por otro string (`['cines']`, no `['movies']`)
- hook + feature

---

## Errores frecuentes

| Qué pasa | Causa habitual | Qué hacer |
|---|---|---|
| Vite: `Failed to load url ... .js` | Import sin extensión | Usa `.ts` / `.tsx` en el import relativo |
| `data` es `undefined` y TypeScript se queja | Pintaste `data.title` sin guardar loading | Envuelve con `QueryState` y `{data ? ... : null}` |
| Se dispara el GET con `id = 0` | Olvidaste `enabled` | `enabled: id > 0` |
| La UI usa `vote_average` | Importaste el DTO en el componente | Importa `Movie` / `MovieDetail` desde `domain/` |
| 401 Token inválido | `.env` mal o servidor viejo | Revisa `VITE_TMDB_TOKEN` y reinicia `npm run dev` |
| Dos listados se pisan en cache | Misma `queryKey` | La key debe incluir el nombre del listado y la página |

---

## Cómo saber que terminaste

1. `npx tsc -b` no muestra errores.
2. React Query Devtools muestra la key nueva (`['movies', 'detail', 550]`).
3. La página muestra loading, luego datos, y el botón Reintentar vuelve a pegarle a TMDB.

Cuando eso pase, el endpoint está integrado al estilo del proyecto. El siguiente se copia igual, cambiando nombres.
