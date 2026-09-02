type MovieTrailerProps = {
  youtubeKey: string
  title: string
  autoPlay?: boolean
}

export function MovieTrailer({ youtubeKey, title, autoPlay = false }: MovieTrailerProps) {
  const src = `https://www.youtube-nocookie.com/embed/${youtubeKey}${autoPlay ? '?autoplay=1' : ''}`

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-ink-soft">
      <iframe
        src={src}
        title={`Trailer for ${title}`}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
