import { formatDay, formatMonth } from '@/lib/format'
import { Icon } from './Icon'

export function Checked({ date, long, className }: { date: string; long?: boolean; className?: string }) {
  return (
    <span className={`checked${className ? ` ${className}` : ''}`}>
      <Icon name="checkc" size={15} strokeWidth={2} />
      {long ? `เช็คล่าสุด ${formatDay(date)} โดยทีม SawasDeeDog` : `เช็คล่าสุด ${formatMonth(date)}`}
    </span>
  )
}
