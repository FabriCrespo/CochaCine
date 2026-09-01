type MovieTrailerProps = {
  youtubeKey: string
  title: string
}

export function MovieTrailer({ youtubeKey, title }: MovieTrailerProps) {
  const src = `https://www.youtube-nocookie.com/embed/${youtubeKey}`

  return (
    <div className="relative aspect-video w-full overflow-hidden ring-1 ring-brand/35">
      <iframe
        src={src}
        title={`Trailer de ${title}`}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
