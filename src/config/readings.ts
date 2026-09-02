/**
 * Lecturas destacadas en la home (enlaces externos, inglés).
 * Títulos y fuentes; el texto corto es nuestro, no el artículo.
 */

export type FeaturedReading = {
  id: string
  kicker: string
  title: string
  dek: string
  href: string
  year: string
  image: string
  imageAlt: string
  /** CSS object-position so the still crops on the subject. */
  imagePosition: string
}

export const FEATURED_READINGS: FeaturedReading[] = [
  {
    id: 'ukamau',
    kicker: 'MUBI Notebook',
    title: 'The Grupo Ukamau',
    dek: 'How Bolivia’s revolutionary filmmakers tried to craft a new language for Indigenous life and resistance — from Ukamau to The Secret Nation.',
    href: 'https://mubi.com/en/notebook/posts/notebook-primer-the-grupo-ukamau',
    year: '2025',
    image: '/readings/ukamau.jpg',
    imageAlt: 'Still of an Andean dancer from The Secret Nation, featured in the MUBI primer',
    imagePosition: 'center 22%',
  },
  {
    id: 'crash-course',
    kicker: 'ReVista · Harvard',
    title: 'Crash Course on Bolivian Cinema',
    dek: 'Velasco Maidana, Jorge Ruiz, and the long shadow of Sanjinés — a map of a cinema that exists against the odds.',
    href: 'https://revista.drclas.harvard.edu/crash-course-on-bolivian-cinema/',
    year: '2011',
    image: '/readings/cinemateca.jpg',
    imageAlt: 'Poster wall at the Cinemateca Boliviana, photographed for ReVista',
    imagePosition: 'center 40%',
  },
  {
    id: 'utama',
    kicker: 'Cine Las Americas',
    title: 'Utama',
    dek: 'Alejandro Loayza Grisi’s Sundance-winning film of a Quechua couple facing drought, time, and the highlands.',
    href: 'https://cinelasamericas.org/claiff24/2022/utama/',
    year: '2022',
    image: '/readings/utama.jpg',
    imageAlt: 'Still from Utama of an elderly couple in the Altiplano',
    imagePosition: 'center 48%',
  },
]
