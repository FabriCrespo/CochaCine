/**
 * Tres películas que bajan de los maestros al cine de ahora.
 * Copy editorial en inglés; los IDs apuntan al catálogo.
 */

import {
  TMDB_MOVIE_AVERNO,
  TMDB_MOVIE_LA_HIJA_CONDOR,
  TMDB_MOVIE_UTAMA,
} from './constants.ts'

export type ContemporaryFilm = {
  tmdbId: number
  year: string
  director: string
  title: string
  dek: string
}

export const CONTEMPORARY_INTRO = {
  kicker: 'The lineage',
  title: ['From the masters', 'to a new generation'],
  paragraphs: [
    'Ruiz, Sanjinés, and Loayza did not leave a closed canon. They left a climate. One filmed the land when Bolivia barely had a cinema; one gave that land a militant grammar; one let the country laugh at itself without leaving it. A younger cinema still walks in that weather.',
    'What follows is a short descent into the present. Three films, three rooms in the same house: the underworld of La Paz, the silence of the Altiplano, and a condor’s daughter on the path between mountain and city.',
  ],
} as const

export const CONTEMPORARY_FILMS: ContemporaryFilm[] = [
  {
    tmdbId: TMDB_MOVIE_AVERNO,
    year: '2018',
    director: 'Marcos Loayza',
    title: 'Averno',
    dek: 'A bootblack named Tupah goes looking for his uncle in the Averno — the Andean night where the dead keep company with the living. Loayza’s late feature is La Paz as fever: popular culture, opposite faces, a city that will not stay on one side of the grave. The master, still inventing.',
  },
  {
    tmdbId: TMDB_MOVIE_UTAMA,
    year: '2022',
    director: 'Alejandro Loayza Grisi',
    title: 'Utama',
    dek: 'Virginio and Sisa, an elderly Quechua couple, endure a drought that will not break. Loayza Grisi — with Marcos as producer — took this patient highland film to Sundance, and with it a new generation of Bolivian cinema into the world. A handoff, held in a long look.',
  },
  {
    tmdbId: TMDB_MOVIE_LA_HIJA_CONDOR,
    year: '2025',
    director: 'Álvaro Olmos Torrico',
    title: 'La Hija Cóndor',
    dek: 'Olmos Torrico follows a midwife through the mountains: time, gaze, the path between countryside and city. After Toronto and a long festival life, the film returns home as the new sensation of Bolivian cinema — still being written into the archive.',
  },
]

export const CONTEMPORARY_CLOSE = {
  kicker: 'The present',
  title: ['Contemporary', 'cinema'],
  dek: 'The house is not a museum. These are three of its newest rooms — and the door is still open.',
} as const
