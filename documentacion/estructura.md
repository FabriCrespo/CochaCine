# Estructura del proyecto

Cochacine está partido en **capas**. Cada carpeta tiene un trabajo y no se mete en el de las otras. Así, cuando TMDB cambie un campo o quieras un endpoint nuevo, sabes exactamente qué archivo tocar.

## Árbol de `src/`

```
src/
├── main.tsx                          QueryClient + BrowserRouter.
├── App.tsx                           <Routes>: hoy solo `/`.
├── index.css                         Tailwind.
├── vite-env.d.ts                     Declara VITE_TMDB_TOKEN.
│
├── config/                           Cosas que no son de un feature concreto.
│   ├── env.ts                        Lee y valida el .env. Única puerta a import.meta.env.
│   └── constants.ts                  URLs fijas, idioma, timeout, tamaños de imagen.
│
├── lib/
│   └── dates.ts                      date-fns: formateo de fechas (cartelera).
│
├── domain/                           Modelos de "nuestra" app. Cero Axios, cero React.
│   └── movie.ts                      Movie, PopularMoviesPage (TMDB).
│
├── api/
│   ├── http/
│   │   ├── axiosClient.ts            Axios de TMDB (Bearer).
│   │   └── errors.ts                 AppError (errores limpios para la UI).
│   ├── tmdb/                         The Movie Database (incluye search).
│   └── cinecenter/                   HTML público de Cine Center (JSON-LD).
│
├── query/
│   ├── queryClient.ts
│   ├── keys.ts                       movieKeys.
│   └── movies/usePopularMovies.ts
│
├── features/
│   └── movies/                       Grilla de populares TMDB.
│
└── components/                       UI genérica, no sabe de TMDB.
    ├── layout/AppShell.tsx           Header, fecha de hoy y fondo.
    └── feedback/QueryState.tsx       Loading / error / vacío / éxito.
```

Fuera de `src/`:

- `.env` — token de TMDB (`VITE_TMDB_TOKEN`). No se sube a git.
- `.env.example` — plantilla vacía para copiar el nombre de la variable.
- `documentacion/` — esta guía.

## Por qué hay dos "películas" (DTO vs dominio)

TMDB manda esto:

```ts
vote_average, poster_path, release_date
```

La UI usa esto:

```ts
rating, posterUrl, releaseYear
```

| Capa | Archivo | Nombre | ¿Lo ve la UI? |
|---|---|---|---|
| DTO (externo) | `api/tmdb/tmdb.types.ts` | `TmdbMovieListItemDto` | No |
| Dominio (interno) | `domain/movie.ts` | `Movie` | Sí |

El puente es `api/tmdb/mappers.ts`. TypeScript te impide usar `vote_average` en un componente: ese campo no existe en `Movie`. Eso no es molestia, es el candado.

## Qué tocas y qué no

| Quieres... | Tocas | No tocas |
|---|---|---|
| Un endpoint nuevo de películas | `tmdb/` + `query/movies/` + `features/movies/` | `axiosClient.ts` (ya sirve) |
| Cambiar el token / timeout | `config/` o `.env` | Los componentes |
| Cambiar el texto de error de red | `api/http/errors.ts` | Cada página |
| Cambiar el header de la app | `components/layout/AppShell.tsx` | Las páginas |
| Un listado de series | Nueva carpeta `api/tmdb` o `tv.api.ts` + `query/tv/` + `features/tv/` | Reusar `MovieCard` a ciegas |

## Imports

Este proyecto usa TypeScript con `allowImportingTsExtensions`. Los imports relativos **llevan extensión**:

```ts
import { usePopularMovies } from '../../query/movies/usePopularMovies.ts'
import type { Movie } from '../../../domain/movie.ts'
```

Si omites `.ts` / `.tsx`, Vite busca un `.js` que no existe y la app se rompe.

## Reglas que no se saltan

1. Los componentes no importan `axiosClient` ni `fetchPopularMovies`.
2. Los hooks de React Query no pintan HTML. Solo piden datos.
3. `movies.api.ts` no usa React (`useState`, `useQuery`, JSX).
4. Los DTOs de TMDB no salen de `api/tmdb/`.
5. Un path de TMDB se registra primero en `endpoints.ts`, no se hardcodea en el `fetch`.
