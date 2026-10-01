import Image from 'next/image'
import Link from 'next/link'

// Round mark cut from the SawasDeeDog.com logo (design/logo/sawasdeedog-logo.webp).
// Favicons: src/app/icon.png and src/app/apple-icon.png.
export function LogoMark({ size }: { size: number }) {
  return <Image src="/logo.png" width={size} height={size} alt="" unoptimized priority />
}

export function Brand({ size = 'regular' }: { size?: 'regular' | 'small' | 'large' }) {
  const mark = size === 'small' ? 26 : size === 'large' ? 34 : 30
  return (
    <Link
      href="/"
      className={`brand${size === 'small' ? ' brand--small' : ''}`}
      aria-label="SawasDeeDog หน้าแรก"
    >
      <LogoMark size={mark} />
      <span className="brand__name" aria-hidden="true">
        SawasDeeDog
      </span>
    </Link>
  )
}
