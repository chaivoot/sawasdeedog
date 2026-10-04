import { thumbUrl } from '@/lib/photo-urls'
import { Icon } from './Icon'
import { PhotoImg } from './PhotoImg'

type Props = {
  src?: string
  alt: string
  className?: string
  iconSize?: number
  /** Load the card-sized copy (listing cards); falls back to the full photo. */
  small?: boolean
}

/** A photo, or the striped placeholder from the mockups when there is none yet. */
export function Photo({ src, alt, className, iconSize = 28, small }: Props) {
  const thumb = small && src ? thumbUrl(src) : undefined
  return (
    <div
      className={`photo${className ? ` ${className}` : ''}`}
      role={src ? undefined : 'img'}
      aria-label={src ? undefined : alt}
    >
      {thumb && src ? (
        <PhotoImg src={thumb} fallback={src} alt={alt} />
      ) : src ? (
        // eslint-disable-next-line @next/next/no-img-element -- storage URLs; sizes are made at upload
        <img src={src} alt={alt} loading="lazy" decoding="async" />
      ) : (
        <Icon name="image" size={iconSize} strokeWidth={1.6} />
      )}
    </div>
  )
}
