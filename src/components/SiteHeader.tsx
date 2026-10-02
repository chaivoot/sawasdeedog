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
          <AddPlaceButton variant="pill" />
        </header>
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
