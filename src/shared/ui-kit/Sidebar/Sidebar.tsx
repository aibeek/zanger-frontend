'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { useTranslations } from 'next-intl'
import { useLoginStore } from '@/features/auth/login'
import { authService } from '@/features/auth/login/service'
import { ProfileAvatar } from '@/entities/profile'
import s from './Sidebar.module.scss'

// Dashboard icons
import MainIcon from '@/app/assets/icons/dashboard-icons/Main.svg'
import ProfileIcon from '@/app/assets/icons/dashboard-icons/myprofile.svg'
import ApplicationsIcon from '@/app/assets/icons/dashboard-icons/my-applications.svg'
import ChatIcon from '@/app/assets/icons/dashboard-icons/chat.svg'
import SubscriptionIcon from '@/app/assets/icons/dashboard-icons/subscription.svg'
import FaqIcon from '@/app/assets/icons/dashboard-icons/faq.svg'
import SupportIcon from '@/app/assets/icons/dashboard-icons/support.svg'
import ZangerIcon from '@/app/assets/icons/dashboard-icons/ZANGER.svg'
import LogoutIcon from '@/app/assets/icons/dashboard-icons/logout.svg'

interface SidebarProps {
    language: string
}

export const Sidebar = ({ language }: SidebarProps) => {
    const { personalData, reset } = useLoginStore()
    const pathname = usePathname()
    const router = useRouter()
    const t = useTranslations()
    
    const name = personalData?.name ?? ''
    const icon = personalData?.icon ?? ''
    const role = Cookies.get('role')
    
    const handleLogout = () => {
        authService.logout()
        reset()
        router.push(`/${language}`)
    }

    const menuItems = [
        {
            id: 'main',
            title: t('dashboard.sidebar.main'),
            icon: MainIcon,
            href: `/${language}`,
        },
        {
            id: 'profile',
            title: t('dashboard.sidebar.profile'),
            icon: ProfileIcon,
            href: `/${language}/dashboard/profile`,
        },
        // {
        //     id: 'applications',
        //     title: t('dashboard.sidebar.applications'),
        //     icon: ApplicationsIcon,
        //     href: `/${language}/dashboard/applications`,
        // },
        // {
        //     id: 'chats',
        //     title: t('dashboard.sidebar.chats'),
        //     icon: ChatIcon,
        //     href: `/${language}/dashboard/chats`,
        // },
        {
            id: 'subscription',
            title: t('dashboard.sidebar.subscription'),
            icon: SubscriptionIcon,
            href: `/${language}/dashboard/subscription`,
        },
        {
            id: 'faq',
            title: t('dashboard.sidebar.faq'),
            icon: FaqIcon,
            href: `/${language}/dashboard/faq`,
        },
        // {
        //     id: 'support',
        //     title: t('dashboard.sidebar.support'),
        //     icon: SupportIcon,
        //     href: `/${language}/dashboard/support`,
        // },
    ]

    return (
        <aside className={s.sidebar}>
            <div className={s.sidebarHeader}>
                <div className={s.logo}>
                    <Image src={ZangerIcon} alt="Zanger Logo" className={s.logoIcon} width={24} height={24} />
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
                {menuItems.map((item) => {
                    return (
                        <Link 
                            key={item.id}
                            href={item.href}
                            className={`${s.navItem} ${pathname === item.href ? s.navItemActive : ''}`}
                        >
                            <Image src={item.icon} alt={item.title} className={s.navIcon} width={20} height={20} />
                            <span className={s.navText}>{item.title}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className={s.sidebarFooter}>
                <button className={s.logoutBtn} onClick={handleLogout}>
                     <Image
                                src={LogoutIcon}
                                alt="Logout"
                                className={s.logoutIcon}
                                width={20}
                                height={20}
                            />
                    <span className={s.logoutText}>{t('dashboard.sidebar.logout')}</span>
                </button>
                <div className={s.copyright}>
                    {t('dashboard.sidebar.copyright')}
                </div>
            </div>
        </aside>
    )
}
