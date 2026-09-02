/**
 * Perfiles de directores. El texto editorial vive en src/data/directors.json.
 * Retratos y copy del spotlight se mezclan aquí.
 */

import directorsData from '../data/directors.json' with { type: 'json' }

export type FilmmakerAward = {
  year: number
  award: string
  festival?: string
  organization?: string
  film?: string
  description?: string
}

export type FilmmakerFilm = {
  title: string
  english_title?: string
  original_title?: string
  alternative_title?: string
  year: number | string
  type?: string
  role?: string
  co_director?: string
  country?: string
  episodes?: number
  imdb_id?: string | null
  director?: string
}

export type Filmmaker = {
  id: string
  name: string
  full_name: string
  nationality: string
  birth_date: string
  birth_place: string
  death_date?: string
  death_place?: string
  occupation: string[]
  active_years: string
  education?: string[]
  organizations?: { name: string; role: string; description: string }[]
  teachers_and_influences?: string[]
  short_bio?: string
  biography: string
  impact?: string
  cinematic_legacy?: string
  themes?: string[]
  career_highlights: string[]
  cinematic_themes: string[]
  cinematic_style: string
  legacy: string
  books_and_writings?: string[]
  other_arts?: string[]
  major_awards: FilmmakerAward[]
  imdb?: {
    name_id: string
    name: string
    note?: string
    director_credits?: number
    writer_credits?: number
    producer_credits?: number
    cinematographer_credits?: number
  }
  imdb_filmography: FilmmakerFilm[]
  complete_historical_filmography?: FilmmakerFilm[]
  notable_producing_credits?: FilmmakerFilm[]
}

type Portrait = {
  image: string
  imageAlt: string
  imagePosition: string
  kicker: string
}

const PORTRAITS: Record<string, Portrait> = {
  'jorge-ruiz': {
    image: '/directors/jorgeruiz.png',
    imageAlt: 'Illustrated portrait of Jorge Ruiz',
    imagePosition: 'center 42%',
    kicker: 'Director Spotlight',
  },
  'jorge-sanjines': {
    image: '/directors/jorgesanjinez.png',
    imageAlt: 'Illustrated portrait of Jorge Sanjinés',
    imagePosition: 'center 18%',
    kicker: 'Director Spotlight',
  },
  'marcos-loayza': {
    image: '/directors/marcosloayza.png',
    imageAlt: 'Illustrated portrait of Marcos Loayza',
    imagePosition: 'center 16%',
    kicker: 'Director Spotlight',
  },
}

const SPOTLIGHT_ORDER = ['jorge-ruiz', 'jorge-sanjines', 'marcos-loayza'] as const

export type SpotlightDirector = Filmmaker &
  Portrait & {
    givenName: string
    familyName: string
  }

const filmmakers = directorsData.filmmakers as Filmmaker[]

export const SPOTLIGHT_DIRECTORS: SpotlightDirector[] = SPOTLIGHT_ORDER.flatMap((id) => {
  const filmmaker = filmmakers.find((entry) => entry.id === id)
  const portrait = PORTRAITS[id]
  if (!filmmaker || !portrait) return []
  return [withPortrait(filmmaker, portrait)]
})

export function findSpotlightDirector(id: string | undefined): SpotlightDirector | null {
  if (!id) return null
  return SPOTLIGHT_DIRECTORS.find((director) => director.id === id) ?? null
}

function withPortrait(filmmaker: Filmmaker, portrait: Portrait): SpotlightDirector {
  const [givenName, ...family] = filmmaker.name.split(' ')
  return {
    ...filmmaker,
    ...portrait,
    givenName: givenName ?? filmmaker.name,
    familyName: family.join(' '),
  }
}
