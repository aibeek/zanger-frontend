import Image from 'next/image'
import { ReactNode } from 'react'

import s from './AuthShell.module.scss'

type AuthShellProps = {
  children: ReactNode
  rightHeader?: ReactNode
}

export function AuthShell({ children, rightHeader }: AuthShellProps) {
  return (
    <div className={s.page}>
      <div className={s.container}>
        {/* Left promo panel */}
        <aside className={s.promo} aria-hidden>
          <div className={s.promoInner}>
            <div className={s.brandBlock}>
              <Image src="/logo.svg" alt="Zanger" width={200} height={200} />
              <h2 className={s.brandTitle}>ZANGER</h2>
              <p className={s.brandSubtitle}>Юридическая платформа Zanger</p>
              <p className={s.brandDescription}>
                Сервис по взаимодействию клиентов и юристов
              </p>
            </div>
          </div>
        </aside>

        {/* Right panel */}
        <main className={s.panel}>
          <div className={s.panelInner}>
            {rightHeader}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
