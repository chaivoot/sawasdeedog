import { MIN_RATINGS_TO_SHOW } from '@/lib/limits'

const STAR = 'M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z'

/** One star; `fill` 0..1 lets the average show partial stars. */
export function Star({ size = 18, fill = 1 }: { size?: number; fill?: number }) {
  const id = `s${Math.round(fill * 100)}`
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="star">
      <defs>
        <linearGradient id={id}>
          <stop offset={fill} stopColor="var(--color-accent)" />
          <stop offset={fill} stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d={STAR}
        fill={`url(#${id})`}
        stroke="var(--star-stroke)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function hasEnoughRatings(rating?: { count: number }) {
  return Boolean(rating && rating.count >= MIN_RATINGS_TO_SHOW)
}

/** "★ 4.3 (12)" — only once enough people have rated, otherwise nothing. */
export function RatingBadge({ rating }: { rating?: { count: number; avg: number } }) {
  if (!rating || !hasEnoughRatings(rating)) return null
  return (
    <span className="rating-badge" aria-label={`คะแนน ${rating.avg.toFixed(1)} จาก 5 จาก ${rating.count} คน`}>
      <Star size={15} />
      <b>{rating.avg.toFixed(1)}</b>
      <span>({rating.count})</span>
    </span>
  )
}
