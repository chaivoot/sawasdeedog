import Link from 'next/link'
import { Icon } from './Icon'
import { LogoMark } from './Logo'

type Props = {
  title: string
  body: string
  primary: { href: string; label: string }
  secondary?: { href: string; label: string }
  compact?: boolean
}

export function EmptyState({ title, body, primary, secondary, compact }: Props) {
  return (
    <div className={`empty${compact ? ' empty--compact' : ''}`}>
      <span className="empty__icon">
        <LogoMark size={44} />
      </span>
      <h2>{title}</h2>
      <p>{body}</p>
      <div className="empty__actions">
        <Link href={primary.href} className="btn btn--primary btn--block">
          <Icon name="plus" size={20} strokeWidth={2.2} />
          <span>{primary.label}</span>
        </Link>
        {secondary && (
          <Link href={secondary.href} className="btn btn--secondary btn--block">
            <span>{secondary.label}</span>
          </Link>
        )}
      </div>
    </div>
  )
}
