import Image from 'next/image'
import { ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n'
import { policyURL, termsURL } from '@/shared/lib/consts/urls'

import s from './AuthShell.module.scss'

type AuthShellProps = {
  children: ReactNode
  rightHeader?: ReactNode
  title?: string
  showNavigation?: boolean
  navigationText?: string
  navigationLinkText?: string
  navigationLinkHref?: string
  showDisclaimer?: boolean
}

export function AuthShell({ 
  children, 
  rightHeader, 
  title,
  showNavigation = false,
  navigationText,
  navigationLinkText,
  navigationLinkHref = '/auth/login',
  showDisclaimer = false,
}: AuthShellProps) {
  const t = useTranslations('auth.shell')

  const navText = navigationText || t('haveAccount')
  const navLinkText = navigationLinkText || t('loginLink')
  
  // Хедер с навигацией справа вверху
  const defaultHeader = showNavigation ? (
    <div className={s.panelHeader}>
      <div />
      <div className={s.panelNav}>
        <span className={s.navText}>{navText}</span>
        <Link href={navigationLinkHref} className={s.navLink}>
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
            
            {/* Центральный логотип с текстом */}
            <div className={s.centerBrand}>
              <Image src="/logo-blue.svg" alt="Zanger" width={48} height={48} />
              <span className={s.centerBrandText}>ZANGER</span>
            </div>
            
            {title && (
              <h1 className={s.panelTitle}>
                {title}
              </h1>
            )}
            <div className={s.panelContent}>
              {children}
            </div>
            
            {/* Disclaimer */}
            {showDisclaimer && (
              <div className={s.disclaimer}>
                <span>
                  {t('registration.warningText')}{' '}
                  <Link href={policyURL} className={s.disclaimerLink} target="_blank">
                    {t('registration.privacyPolicy')}
                  </Link>
                  {' '}{t('registration.and')}{' '}
                  <Link href={termsURL} className={s.disclaimerLink} target="_blank">
                    {t('registration.publicOffer')}
                  </Link>
                </span>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
