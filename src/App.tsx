/**
 * =============================================================================
 * App — rutas
 * =============================================================================
 *
 *   /                  → catálogo de cine boliviano
 *   /pelicula/:movieId → ficha
 *   /bolivia           → redirige a /
 *   /admin             → editor de overrides
 *   /admin/:movieId    → editor de una película
 */

import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router'
import { BolivianMoviesPage } from './features/movies/BolivianMoviesPage.tsx'
import { MovieDetailPage } from './features/movies/MovieDetailPage.tsx'
import { AdminPage } from './features/admin/AdminPage.tsx'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname.startsWith('/admin') || pathname === '/') return
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<BolivianMoviesPage />} />
        <Route path="/pelicula/:movieId" element={<MovieDetailPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/:movieId" element={<AdminPage />} />
        <Route path="/bolivia" element={<Navigate to="/" replace />} />
        <Route path="/populares" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
