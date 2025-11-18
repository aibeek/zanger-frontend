'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import s from './EcpSidebar.module.scss'

export const EcpSidebar: React.FC = () => {
  const [openDocs, setOpenDocs] = useState(true)
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('ecp.sidebar')

  return (
    <aside className={s.aside}>
      <div className={s.logo}>
        <Image
          src="/logo.svg"
          alt="ZANGER"
          width={40}
          height={48}
          className={s.brandIcon}
          priority
        />
        <span className={s.brandText}>ZANGER</span>
      </div>

      <nav className={s.nav}>
        <div className={s.item} onClick={() => router.push(`/${locale}/dashboard/profile`)}>🏠 {t('home')}</div>
        <div className={s.item} onClick={() => router.push(`/${locale}/ecp/create`)}>📄 {t('createDocument')}</div>
        <div className={s.item} onClick={() => router.push(`/${locale}/ecp/statuses`)}>📌 {t('myStatuses')}</div>

        <div className={s.dropdownHeader} onClick={() => setOpenDocs(!openDocs)}>
          <div className={s.dropdownTitle}>
            <span>🗂️</span>
            <span>{t('myDocuments')}</span>
          </div>
          <span className={s.chevron}>{openDocs ? '▾' : '▸'}</span>
        </div>

        {openDocs && (
          <div className={s.dropdown}>
            <div className={s.docItem} onClick={() => router.push(`/${locale}/ecp/incoming`)}>
              <div className={s.docItemTitle}>
                <span>{t('incoming')}</span>
              </div>
            </div>
            <div className={s.docItem} onClick={() => router.push(`/${locale}/ecp/sent`)}>
              <div className={s.docItemTitle}>
                <span>{t('sent')}</span>
              </div>
            </div>
            <div className={s.docItem} onClick={() => router.push(`/${locale}/ecp/drafts`)}>
              <div className={s.docItemTitle}>
                <span>{t('drafts')}</span>
              </div>
            </div>
          </div>
        )}

        <div className={s.item} onClick={() => router.push(`/${locale}/ecp/archive`)}>🗄️ {t('archive')}</div>
        <div className={s.item} onClick={() => router.push(`/${locale}/ecp/trash`)}>🗑️ {t('trash')}</div>
        <div className={s.item} onClick={() => router.push(`/${locale}/ecp/counterparties`)}>👥 {t('counterparties')}</div>

      </nav>

      <div className={s.footer}>
        <div className={s.item}>❓ {t('faq')}</div>
        <div className={s.item}>🔔 {t('support')}</div>
      </div>
    </aside>
  )
}
