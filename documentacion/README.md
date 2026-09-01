# Documentación de Cochacine

Guía para entender el proyecto y copiar el mismo patrón cuando agregues un endpoint de TMDB.

| Documento | Qué responde |
|---|---|
| [estructura.md](./estructura.md) | Qué hay en cada carpeta y por qué existe |
| [flujo-de-datos.md](./flujo-de-datos.md) | Cómo viaja una petición desde la pantalla hasta TMDB |
| [anadir-endpoint.md](./anadir-endpoint.md) | Receta paso a paso para un endpoint nuevo |

Empieza por **estructura**, luego **flujo**, y cuando vayas a codear abre **añadir endpoint**.

Regla de oro: un componente **nunca** llama a Axios. Solo habla con un hook de React Query (`usePopularMovies`, `useMovie`, etc.).
