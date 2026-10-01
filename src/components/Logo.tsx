import Image from 'next/image'
import Link from 'next/link'

// The mark lives in public/logo.svg (and src/app/icon.svg for the favicon).
// Swap those two files when the final logo is chosen.
export function LogoMark({ size }: { size: number }) {
  return <Image src="/logo.svg" width={size} height={size} alt="" unoptimized priority />
}

export function Brand({ size = 'regular' }: { size?: 'regular' | 'small' | 'large' }) {
  const mark = size === 'small' ? 26 : size === 'large' ? 34 : 30
  return (
    <Link
      href="/"
      className={`brand${size === 'small' ? ' brand--small' : ''}`}
      aria-label="sawasdee dog หน้าแรก"
    >
      <LogoMark size={mark} />
      <span className="brand__name" aria-hidden="true">
        sawasdee dog
      </span>
    </Link>
  )
}
