/**
 * =============================================================================
 * MAPA DEL PROYECTO — léelo antes de tocar código
 * =============================================================================
 *
 * Flujo de una petición (de arriba hacia abajo):
 *
 *   UI (BolivianMoviesPage / MovieDetailPage)
 *     → hook (useBolivianMovies / useMovie)
 *       → fetchBolivianMovies / fetchMovieById + Axios
 *         → mapper (DTO TMDB → Movie / MovieDetail)
 *         → overlay Supabase (si hay corrección editorial)
 *           → UI
 *
 * Rutas:
 *   /                  catálogo
 *   /pelicula/:movieId ficha (paths.movie(id) en lib/paths.ts)
 *   /admin             editor de overrides (paths.admin)
 *
 * Carpetas:
 *
 *   config/          constantes y .env tipado
 *   domain/          modelos de la app (Movie). Cero Axios.
 *   api/http/        instancia Axios + AppError
 *   api/tmdb/        endpoints, DTOs, mappers, fetch*
 *   api/imdb/        plot en inglés cuando TMDB no lo tiene
 *   api/supabase/    overrides editoriales (póster, sinopsis, trailer)
 *   query/           QueryClient, query keys, hooks
 *   features/movies/ páginas y componentes del feature
 *   components/      UI reutilizable (layout, estados)
 *
 * Receta corta para un endpoint nuevo (detalle):
 *   1. DTO en api/tmdb/tmdb.types.ts
 *   2. Tipo de dominio en domain/movie.ts
 *   3. Path en api/tmdb/endpoints.ts
 *   4. Mapper en api/tmdb/mappers.ts
 *   5. fetchX en api/tmdb/movies.api.ts
 *   6. Key en query/keys.ts
 *   7. Hook useX en query/movies/
 *   8. Página en features/movies/
 *
 * No llames axiosClient ni fetchBolivianMovies desde un componente.
 * El componente solo habla con el hook.
 */

export {}
