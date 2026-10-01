import { Icon } from './Icon'

type Props = {
  src?: string
  alt: string
  className?: string
  iconSize?: number
}

/** A photo, or the striped placeholder from the mockups when there is none yet. */
export function Photo({ src, alt, className, iconSize = 28 }: Props) {
  return (
    <div
      className={`photo${className ? ` ${className}` : ''}`}
      role={src ? undefined : 'img'}
      aria-label={src ? undefined : alt}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- photo source/CDN not decided yet
        <img src={src} alt={alt} loading="lazy" />
      ) : (
        <Icon name="image" size={iconSize} strokeWidth={1.6} />
      )}
    </div>
  )
}
