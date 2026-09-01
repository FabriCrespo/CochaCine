# Flujo de datos

Así viaja **GET /movie/popular** hoy. Cualquier endpoint nuevo debe seguir el mismo camino.

```
Navegador
   │
   │  1. PopularMoviesPage llama usePopularMovies()
   ▼
React Query (queryClient)
   │  Mira el queryKey: ['movies', 'list', 'popular', { page: 1 }]
   │  ¿Hay cache fresco? → devuelve data, no llama a TMDB
   │  ¿No hay cache? → ejecuta queryFn
   ▼
fetchPopularMovies()          api/tmdb/movies.api.ts
   │
   │  2. axiosClient.get<TmdbPopularMoviesDto>('/movie/popular')
   ▼
Interceptor de request        api/http/axiosClient.ts
   │  Pone: Authorization: Bearer <VITE_TMDB_TOKEN>
   ▼
TMDB  https://api.themoviedb.org/3/movie/popular
   │
   │  3. JSON crudo (DTO)
   ▼
Interceptor de response
   │  OK  → AxiosResponse.data
   │  Error → AppError (mensaje limpio)
   ▼
mapPopularMoviesPage()        api/tmdb/mappers.ts
   │  DTO → PopularMoviesPage { movies: Movie[] }
   ▼
usePopularMovies
   │  data, isPending, isError, error, refetch
   ▼
PopularMoviesPage
   │  QueryState pinta loading / error / vacío
   │  MovieGrid pinta las tarjetas
   ▼
Pantalla
```

## Las 4 piezas de React Query que tienes que clavar

| Concepto | En este proyecto | Qué significa |
|---|---|---|
| `queryKey` | `movieKeys.popular(1)` | Identidad del cache. Misma key = mismos datos. |
| `queryFn` | `() => fetchPopularMovies({ page })` | Función pura que llama a la API. Sin `setState`. |
| `staleTime` | 5 minutos en `queryClient.ts` | Mientras los datos estén "frescos", no se vuelve a TMDB. |
| `refetch` | botón Reintentar en `QueryState` | El usuario fuerza una petición nueva. |

## Por qué Axios y React Query no viven en el mismo archivo

- **Axios** sabe de HTTP: URL, token, timeout, status 401.
- **React Query** sabe de UI: loading, cache, reintentos, compartir datos entre pantallas.

Si los mezclas en un componente con `useEffect` + `useState`, pierdes el cache y cada pantalla vuelve a pegarle a TMDB. El hook `usePopularMovies` es el puente: por dentro llama a `fetchPopularMovies`, por fuera le da a la página `{ data, isPending, isError }`.

## Dónde se ve esto en vivo

Con el dev server abierto, el icono de React Query Devtools (abajo a la derecha) muestra la key `['movies', 'list', 'popular', { page: 1 }]` y el JSON ya mapeado (`movies`, `rating`, `posterUrl`).
