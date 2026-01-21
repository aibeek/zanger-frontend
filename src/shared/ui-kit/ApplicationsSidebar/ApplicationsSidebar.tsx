'use client'

import React from 'react'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import Cookies from 'js-cookie'
import { useLoginStore } from '@/features/auth/login'
import { authService } from '@/features/auth/login/service'
import { ProfileAvatar } from '@/entities/profile'
import s from './ApplicationsSidebar.module.scss'

// Icons
import MainIcon from '@/app/assets/icons/dashboard-icons/Main.svg'
import ProfileIcon from '@/app/assets/icons/dashboard-icons/myprofile.svg'
import ChatIcon from '@/app/assets/icons/dashboard-icons/chat.svg'
import SubscriptionIcon from '@/app/assets/icons/dashboard-icons/subscription.svg'
import FaqIcon from '@/app/assets/icons/dashboard-icons/faq.svg'

interface ApplicationsSidebarProps {
  onMobileClose?: () => void
}

export const ApplicationsSidebar: React.FC<ApplicationsSidebarProps> = ({ onMobileClose }) => {
  const router = useRouter()
  const locale = useLocale()
  const pathname = usePathname()
  const t = useTranslations()
  const { personalData, reset } = useLoginStore()
  const name = personalData?.name ?? ''
  const icon = personalData?.icon && !personalData.icon.includes('Lawyer.jpg') ? personalData.icon : ''
  const role = Cookies.get('role')

  const handleLogout = () => {
    authService.logout()
    reset()
    router.push(`/${locale}`)
  }

  const menuItems = [
    {
      id: 'main',
      title: t('dashboard.sidebar.main'),
      icon: MainIcon,
      href: `/${locale}`,
    },
    {
      id: 'profile',
      title: t('dashboard.sidebar.profile'),
      icon: ProfileIcon,
      href: `/${locale}/dashboard/profile`,
    },
    {
      id: 'chats',
      title: t('dashboard.sidebar.chats'),
      icon: ChatIcon,
      href: `/${locale}/dashboard/chats`,
    },
    {
      id: 'subscription',
      title: t('dashboard.sidebar.subscription'),
      icon: SubscriptionIcon,
      href: `/${locale}/dashboard/subscription`,
    },
    {
      id: 'faq',
      title: t('dashboard.sidebar.faq'),
      icon: FaqIcon,
      href: `/${locale}/dashboard/faq`,
    },
  ]

  return (
    <aside className={s.aside}>
      <div className={s.logo}>
        <div className={s.logoContent}>
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
        <button className={s.mobileCloseBtn} onClick={onMobileClose}>
          &times;
        </button>
      </div>

      <div className={s.userProfile}>
        <div className={s.avatarWrapper}>
          <ProfileAvatar avatarUrl={icon} />
        </div>
        <div className={s.userInfo}>
          <div className={s.userName}>{name}</div>
          <div className={s.userRole}>
            {role === 'lawyer'
              ? t('dashboard.sidebar.lawyerRole')
              : t('dashboard.sidebar.clientRole')}
          </div>
        </div>
      </div>

      <nav className={s.nav}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <div
              key={item.id}
              className={`${s.item} ${isActive ? s.itemActive : ''}`}
              onClick={() => router.push(item.href)}
            >
              <Image src={item.icon} alt={item.title} width={18} height={18} />
              <span>{item.title}</span>
            </div>
          )
        })}
      </nav>

      <div className={s.footer}>
        <button className={s.logoutBtn} onClick={handleLogout}>
          <span>{t('header.logout')}</span>
        </button>
        <div className={s.copyright}>
          {t('dashboard.sidebar.copyright')}
        </div>
      </div>
    </aside>
  )
}
