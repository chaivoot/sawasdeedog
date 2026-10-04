import { PEDIGREE, farmRule } from '@/data/criteria'
import { Icon } from './Icon'

/** Gold badge for farms we confirmed issue a pedigree certificate. */
export function PedigreeBadge({ attributes, large }: { attributes: string[]; large?: boolean }) {
  if (!attributes.includes(PEDIGREE)) return null
  return (
    <span className={`pedigree-badge${large ? ' pedigree-badge--large' : ''}`}>
      <Icon name="award" size={large ? 18 : 15} strokeWidth={2.2} />
      {farmRule.badge}
    </span>
  )
}
