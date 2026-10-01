import { iconPaths, type IconName } from './icon-paths'

export type { IconName }

type Props = {
  name: IconName
  size?: number
  strokeWidth?: number
  className?: string
}

/** Line icon from design/icons (24px grid, currentColor). */
export function Icon({ name, size = 24, strokeWidth = 1.8, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={{ flexShrink: 0, display: 'block' }}
      dangerouslySetInnerHTML={{ __html: iconPaths[name] }}
    />
  )
}
