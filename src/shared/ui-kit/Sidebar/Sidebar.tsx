'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Cookies from 'js-cookie'
import { useTranslations } from 'next-intl'
import { useLoginStore } from '@/features/auth/login'
import { ProfileAvatar } from '@/entities/profile'
import s from './Sidebar.module.scss'

interface SidebarProps {
    language: string
}

export const Sidebar = ({ language }: SidebarProps) => {
    const { personalData } = useLoginStore()
    const pathname = usePathname()
    const t = useTranslations()
    
    const name = personalData?.name ?? ''
    const icon = personalData?.icon ?? ''
    const role = Cookies.get('role')

    const menuItems = [
        {
            id: 'main',
            title: t('dashboard.sidebar.main'),
            icon: '🏠',
            href: `/${language}`,
        },
        {
            id: 'profile',
            title: t('dashboard.sidebar.profile'),
            icon: '👤',
            href: `/${language}/dashboard/profile`,
        },
        {
            id: 'applications',
            title: t('dashboard.sidebar.applications'),
            icon: '📋',
            href: `/${language}/dashboard/applications`,
        },
        {
            id: 'chats',
            title: t('dashboard.sidebar.chats'),
            icon: '💬',
            href: `/${language}/dashboard/chats`,
        },
        {
            id: 'subscription',
            title: t('dashboard.sidebar.subscription'),
            icon: '⭐',
            href: `/${language}/dashboard/subscription`,
        },
        {
            id: 'faq',
            title: t('dashboard.sidebar.faq'),
            icon: '❓',
            href: `/${language}/dashboard/faq`,
        },
        {
            id: 'support',
            title: t('dashboard.sidebar.support'),
            icon: '👍',
            href: `/${language}/dashboard/support`,
        },
    ]

    return (
        <aside className={s.sidebar}>
            <div className={s.sidebarHeader}>
                <div className={s.logo}>
                    <span className={s.logoIcon}>🛡️</span>
                    <span className={s.logoText}>ZANGER</span>
                </div>
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


            <nav className={s.navigation}>
                {menuItems.map((item) => (
                    <Link 
                        key={item.id}
                        href={item.href}
                        className={`${s.navItem} ${pathname === item.href ? s.navItemActive : ''}`}
                    >
                        <span className={s.navIcon}>{item.icon}</span>
                        <span className={s.navText}>{item.title}</span>
                    </Link>
                ))}
            </nav>

            <div className={s.sidebarFooter}>
                <button className={s.logoutBtn}>
                    <span className={s.logoutIcon}>🚪</span>
                    <span className={s.logoutText}>{t('dashboard.sidebar.logout')}</span>
                </button>
                <div className={s.copyright}>
                    {t('dashboard.sidebar.copyright')}
                </div>
            </div>
        </aside>
    )
}
