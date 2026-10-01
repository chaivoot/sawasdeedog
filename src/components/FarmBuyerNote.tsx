import { farmRule } from '@/data/criteria'
import { Icon } from './Icon'

/** What our farm listing does and doesn't vouch for, and what buyers should ask for themselves. */
export function FarmBuyerNote({ className = '' }: { className?: string }) {
  return (
    <aside className={`buyer-note ${className}`.trim()} aria-labelledby="buyer-note-title">
      <h2 id="buyer-note-title">
        <Icon name="shield" size={18} strokeWidth={2} />
        ข้อควรรู้ก่อนซื้อ
      </h2>
      <p>{farmRule.scope} ก่อนซื้อควรขอดูเอง เช่น</p>
      <ul>
        {farmRule.buyerChecks.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </aside>
  )
}
