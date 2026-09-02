/**
 * =============================================================================
 * App — rutas
 * =============================================================================
 *
 *   /                    → home (populares + décadas)
 *   /archivo             → catálogo completo con filtros
 *   /pelicula/:movieId   → ficha
 *   /director/:directorId → perfil de director
 *   /admin               → editor de overrides
 */

import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router'
import { HomePage } from './features/movies/HomePage.tsx'
import { CatalogPage } from './features/movies/CatalogPage.tsx'
import { MovieDetailPage } from './features/movies/MovieDetailPage.tsx'
import { DirectorPage } from './features/directors/DirectorPage.tsx'
import { AdminPage } from './features/admin/AdminPage.tsx'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname.startsWith('/admin') || pathname === '/' || pathname === '/archivo') {
      return
    }
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/archivo" element={<CatalogPage />} />
        <Route path="/pelicula/:movieId" element={<MovieDetailPage />} />
        <Route path="/director/:directorId" element={<DirectorPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/:movieId" element={<AdminPage />} />
        <Route path="/bolivia" element={<Navigate to="/" replace />} />
        <Route path="/populares" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
