import { formatYear } from '@/lib/format'
import { Icon } from './Icon'

export function Checked({ date, long, className }: { date: string; long?: boolean; className?: string }) {
  return (
    <span className={`checked${className ? ` ${className}` : ''}`}>
      <Icon name="checkc" size={15} strokeWidth={2} />
      {long ? `เช็คล่าสุดปี ${formatYear(date)} โดยทีม SawasdeeDog` : `เช็คล่าสุดปี ${formatYear(date)}`}
    </span>
  )
}
