'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import Cookies from 'js-cookie'
import { useLoginStore } from '@/features/auth/login'
import { ProfileAvatar } from '@/entities/profile'
import s from './EcpSidebar.module.scss'
import useSWR from 'swr'
import { ecpApi } from '@/shared/api'

export const EcpSidebar: React.FC = () => {
  const [openDocs, setOpenDocs] = useState(true)
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('ecp.sidebar')
  const tCommon = useTranslations()
  const { personalData } = useLoginStore()
  const name = personalData?.name ?? ''
  const icon = personalData?.icon && !personalData.icon.includes('Lawyer.jpg') ? personalData.icon : ''
  const role = Cookies.get('role')
  const { data: counters, mutate: mutateCounters } = useSWR('ecp-counters', async () => {
    try {
      const c = await ecpApi.getCounters()
      if (c && typeof c.incoming_new === 'number') return c
    } catch {}
    try {
      const [inboxRes, ownerRes]: any = await Promise.all([
        ecpApi.listDocuments({ inbox: true, outbox: false, page: 1, limit: 100 }),
        ecpApi.listDocuments({ inbox: false, outbox: true, status: 'WAITING_CREATOR_SIGNATURE', page: 1, limit: 100 }),
      ])
      const inboxItems: any[] = Array.isArray(inboxRes?.data) ? inboxRes.data : Array.isArray(inboxRes) ? inboxRes : []
      const ownerItems: any[] = Array.isArray(ownerRes?.data) ? ownerRes.data : Array.isArray(ownerRes) ? ownerRes : []
      const map = new Map<number, any>()
      for (const it of [...inboxItems, ...ownerItems]) { map.set(it.id, it) }
      const merged: any[] = Array.from(map.values())
      const countNew = merged.reduce((acc, it) => acc + (it?.is_new ? 1 : 0), 0)
      return { incoming_new: countNew }
    } catch {
      return { incoming_new: 0 }
    }
  }, { revalidateOnFocus: true, refreshInterval: 15000 })
  React.useEffect(() => {
    const handler = () => { mutateCounters() }
    window.addEventListener('ecp:revalidate-counters', handler)
    return () => { window.removeEventListener('ecp:revalidate-counters', handler) }
  }, [mutateCounters])

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

      <div className={s.userProfile}>
        <div className={s.avatarWrapper}>
          <ProfileAvatar avatarUrl={icon} />
        </div>
        <div className={s.userInfo}>
          <div className={s.userName}>{name}</div>
          <div className={s.userRole}>
            {role === 'lawyer'
              ? tCommon('dashboard.sidebar.lawyerRole')
              : tCommon('dashboard.sidebar.clientRole')}
          </div>
        </div>
      </div>

      <nav className={s.nav}>
        <div className={s.item} onClick={() => router.push(`/${locale}/dashboard/profile`)}>
          <Image src="/assets/ecp/sidebar-icons/home.svg" alt="home" width={18} height={18} />
          <span>{t('home')}</span>
        </div>
        <div className={s.item} onClick={() => {  router.push(`/${locale}/ecp/create`) }}>
          <Image src="/assets/ecp/sidebar-icons/create-document.svg" alt="create" width={18} height={18} />
          <span>{t('createDocument')}</span>
        </div>
        <div className={s.item} onClick={() => router.push(`/${locale}/ecp/statuses`)}>
          <Image src="/assets/ecp/sidebar-icons/my-statuses.svg" alt="statuses" width={18} height={18} />
          <span>{t('myStatuses')}</span>
        </div>

        <div className={s.dropdownHeader} onClick={() => setOpenDocs(!openDocs)}>
          <div className={s.dropdownTitle}>
            <Image src="/assets/ecp/sidebar-icons/my-documents.svg" alt="my-documents" width={18} height={18} />
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
              {typeof counters?.incoming_new === 'number' && counters?.incoming_new > 0 ? (
                <span className={s.counter}>{Math.min(99, counters.incoming_new)}</span>
              ) : null}
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

        <div className={s.item} onClick={() => router.push(`/${locale}/ecp/archive`)}>
          <Image src="/assets/ecp/sidebar-icons/archive.svg" alt="archive" width={18} height={18} />
          <span>{t('archive')}</span>
        </div>
        <div className={s.item} onClick={() => router.push(`/${locale}/ecp/trash`)}>
          <Image src="/assets/ecp/sidebar-icons/trash.svg" alt="trash" width={18} height={18} />
          <span>{t('trash')}</span>
        </div>
        <div className={s.item} onClick={() => router.push(`/${locale}/ecp/counterparties`)}>
          <Image src="/assets/ecp/sidebar-icons/countryparties.svg" alt="counterparties" width={18} height={18} />
          <span>{t('counterparties')}</span>
        </div>

      </nav>

      <div className={s.footer}>
        <div className={s.item}>
          <Image src="/assets/ecp/sidebar-icons/faq.svg" alt="faq" width={18} height={18} />
          <span>{t('faq')}</span>
        </div>
        <div className={s.item}>
          <Image src="/assets/ecp/sidebar-icons/support.svg" alt="support" width={18} height={18} />
          <span>{t('support')}</span>
        </div>
      </div>
    </aside>
  )
}
