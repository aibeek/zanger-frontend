import Image from 'next/image'
import { ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n'

import s from './AuthShell.module.scss'

type AuthShellProps = {
  children: ReactNode
  rightHeader?: ReactNode
  title?: string
  showNavigation?: boolean
  navigationText?: string
  navigationLinkText?: string
  navigationLinkHref?: string
}

export function AuthShell({ 
  children, 
  rightHeader, 
  title,
  showNavigation = false,
  navigationText,
  navigationLinkText,
  navigationLinkHref = '/auth/login',
}: AuthShellProps) {
  const t = useTranslations('auth.shell')

  const navText = navigationText || t('haveAccount')
  const navLinkText = navigationLinkText || t('loginLink')
  // Если rightHeader не передан, создаем стандартный
  const defaultHeader = showNavigation ? (
    <div className={s.panelHeader}>
      <div></div>
      <div>
        <span style={{ color: '#000000ff', marginRight: 8 }}>{navText}</span>
        <Link href={navigationLinkHref} style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
          {navLinkText}
        </Link>
      </div>
    </div>
  ) : null

  return (
    <div className={s.page}>
      <div className={s.container}>
        {/* Left promo panel */}
        <aside className={s.promo} aria-hidden>
          <div className={s.promoInner}>
            <div className={s.brandBlock}>
              <Image src="/logo.svg" alt="Zanger" width={140} height={140} />
              <h2 className={s.brandTitle}>ZANGER</h2>
              <p className={s.brandSubtitle}>{t('platformTitle')}</p>
              <p className={s.brandDescription}>{t('platformDescription')}</p>
            </div>
          </div>
        </aside>

        {/* Right panel */}
        <main className={s.panel}>
          <div className={s.panelInner}>
            {rightHeader || defaultHeader}
            {title && (
              <h1 className={s.panelTitle}>
                {title}
              </h1>
            )}
            <div className={s.panelContent}>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
