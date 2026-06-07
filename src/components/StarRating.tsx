interface Props {
  rating: number
  size?: 'sm' | 'md'
}

export default function StarRating({ rating, size = 'md' }: Props) {
  const dim = size === 'sm' ? 14 : 18

  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        i < rating ? (
          <svg key={i} width={dim} height={dim} viewBox="0 0 24 24" fill="currentColor" className="text-accent">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ) : (
          <svg key={i} width={dim} height={dim} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-border">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        )
      ))}
    </div>
  )
}
