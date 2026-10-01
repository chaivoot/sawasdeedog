import Link from 'next/link'
import { Brand } from './Logo'
import { Icon } from './Icon'
import { SiteNav } from './SiteNav'

type Props = {
  /** Where the mobile back arrow goes. Omit on the home page. */
  back?: string
  /** Pages with their own mobile top bar (place photos) only show the desktop header. */
  desktopOnly?: boolean
}

export function SiteHeader({ back, desktopOnly }: Props) {
  return (
    <>
      {!desktopOnly && (
        <header className="site-header">
          {back ? (
            <>
              <Link href={back} className="icon-button" aria-label="ย้อนกลับ">
                <Icon name="back" strokeWidth={2} />
              </Link>
              <span className="site-header__center">
                <Brand size="small" />
              </span>
            </>
          ) : (
            <>
              <Brand />
              <span className="site-header__spacer" />
            </>
          )}
          <Link href="/submit" className="submit-pill">
            <Icon name="plus" size={18} strokeWidth={2.2} />
            เสนอสถานที่
          </Link>
        </header>
      )}
      <header className="site-header--desktop">
        <div className="site-header__inner">
          <Brand size="large" />
          <SiteNav />
          <Link href="/submit" className="btn btn--primary btn--sm">
            <Icon name="plus" size={20} strokeWidth={2.2} />
            <span>เสนอสถานที่</span>
          </Link>
        </div>
      </header>
    </>
  )
}
