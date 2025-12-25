import Image from 'next/image'
import { Link } from '@/i18n'
import { ReactNode } from 'react'
import { policyURL, termsURL } from '@/shared/lib/consts/urls'

import s from './AuthLayout.module.scss'

type AuthLayoutProps = {
  title: string
  subtitle?: string
  children: ReactNode
  showTopNavigation?: boolean
  navigationText?: string
  navigationLinkText?: string
  navigationLinkHref?: string
  showDisclaimer?: boolean
  centerLogo?: boolean
}

export function AuthLayout({
  title,
  subtitle,
  children,
  showTopNavigation = true,
  navigationText = 'Есть аккаунт?',
  navigationLinkText = 'Вход',
  navigationLinkHref = '/auth/login',
  showDisclaimer = false,
  centerLogo = false
}: AuthLayoutProps) {
  return (
    <div className={s.page}>
      <div className={s.container}>
        {/* Left promo panel - 40% */}
        <aside className={s.leftPanel}>
          <div className={s.leftPanelContent}>
            <div className={s.brandBlock}>
              <div className={s.brandHeader}>
                <Image src="/happynewyear.svg" alt="Zanger" width={60} height={60} />
                <h2 className={s.brandTitle}>ZANGER</h2>
              </div>
              <p className={s.brandSubtitle}>Юридическая платформа Zanger</p>
              <p className={s.brandDescription}>
                Сервис по взаимодействию клиентов и юристов
              </p>
            </div>
          </div>
        </aside>

        {/* Right panel - 60% */}
        <main className={s.rightPanel}>
          <div className={s.rightPanelContent}>
            {/* Top navigation */}
            {showTopNavigation && (
              <div className={s.topNavigation}>
                {centerLogo ? (
                  // Центрированный логотип для страницы логина
                  <div className={s.centerLogoContainer}>
                    <Link href="/" className={s.logoLink}>
                      <Image src="/happynewyear.svg" alt="Zanger" width={28} height={28} />
                      <span className={s.logoText}>ZANGER</span>
                    </Link>
                    <div className={s.navLinkContainer}>
                      <span className={s.navText}>{navigationText}</span>
                      <Link href={navigationLinkHref} className={s.navLink}>
                        {navigationLinkText}
                      </Link>
                    </div>
                  </div>
                ) : (
                  // Обычная навигация для других страниц
                  <>
                    <Link href="/" className={s.logoLink}>
                      <Image src="/happynewyear.svg" alt="Zanger" width={28} height={28} />
                      <span className={s.logoText}>ZANGER</span>
                    </Link>
                    <div className={s.navLinkContainer}>
                      <span className={s.navText}>{navigationText}</span>
                      <Link href={navigationLinkHref} className={s.navLink}>
                        {navigationLinkText}
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Content area */}
            <div className={s.contentArea}>
              {/* Title section */}
              {title && (
                <div className={s.titleSection}>
                  <h1 className={s.title}>{title}</h1>
                  {subtitle && <p className={s.subtitle}>{subtitle}</p>}
                </div>
              )}

              {/* Dynamic content */}
              <div className={s.content}>
                {children}
              </div>

              {/* Disclaimer */}
              {showDisclaimer && (
                <div className={s.disclaimer}>
                  <span>
                    Создавая аккаунт, вы подтверждаете, что ознакомились и принимаете{' '}
                    <Link href={policyURL} className={s.disclaimerLink} target="_blank">
                      Политику конфиденциальности
                    </Link>
                    {' '}и{' '}
                    <Link href={termsURL} className={s.disclaimerLink} target="_blank">
                      Публичную оферту
                    </Link>
                  </span>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
