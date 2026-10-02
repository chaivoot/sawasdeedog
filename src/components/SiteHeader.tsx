import Link from 'next/link'
import { AddPlaceButton } from './AddPlaceButton'
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
        <>
          {/* Same header on every page so the logo never moves; back sits on its own row below. */}
          <header className="site-header">
            <Brand />
            <span className="site-header__spacer" />
            <AddPlaceButton variant="pill" />
          </header>
          {back && (
            <div className="back-bar">
              <Link href={back} className="back-bar__link">
                <Icon name="back" size={20} strokeWidth={2} />
                ย้อนกลับ
              </Link>
            </div>
          )}
        </>
      )}
      <header className="site-header--desktop">
        <div className="site-header__inner">
          <Brand size="large" />
          <SiteNav />
          <AddPlaceButton variant="button" />
        </div>
      </header>
    </>
  )
}
