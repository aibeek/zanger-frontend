import Image from 'next/image'
import { ReactNode } from 'react'
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
  navigationText = 'Есть аккаунт?',
  navigationLinkText = 'Вход',
  navigationLinkHref = '/auth/login',
  showDisclaimer = false
}: AuthShellProps) {
  // Если rightHeader не передан, создаем стандартный
  const defaultHeader = showNavigation ? (
    <div className={s.panelHeader}>
      <div></div>
      <div>
        <span style={{ color: '#6b7280', marginRight: 8 }}>{navigationText}</span>
        <Link href={navigationLinkHref} style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
          {navigationLinkText}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Image src="/logo.svg" alt="Zanger" width={120} height={120} />
                <h2 className={s.brandTitle}>ZANGER</h2>
              </div>
              <p className={s.brandSubtitle}>Юридическая платформа Zanger</p>
              <p className={s.brandDescription}>
                Сервис по взаимодействию клиентов и юристов
              </p>
            </div>
          </div>
        </aside>

        {/* Right panel */}
        <main className={s.panel}>
          <div className={s.panelInner} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {rightHeader || defaultHeader}
            {title && (
              <h1 style={{
                fontSize: 28,
                color: '#2563eb',
                fontWeight: 800,
                margin: '24px 0 32px',
                textAlign: 'center',
                width: '100%',
                background: 'none',
                border: 'none',
                padding: 0,
                borderRadius: 0
              }}>
                {title}
              </h1>
            )}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {children}
            </div>
          </div>
          {showDisclaimer && (
            <div style={{
              padding: '24px 32px 28px',
              color: '#6b7280',
              fontSize: 12,
              textAlign: 'center',
              lineHeight: 1.5
            }}>
              <span>
                Создавая аккаунт, вы подтверждаете, что ознакомились и принимаете{' '}
                <Link href={policyURL} style={{ color: '#2563eb', textDecoration: 'underline' }} target="_blank">
                  Политику конфиденциальности
                </Link>
                {' '}и{' '}
                <Link href={termsURL} style={{ color: '#2563eb', textDecoration: 'underline' }} target="_blank">
                  Публичную оферту
                </Link>
              </span>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
