'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
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
// removed logout icon per new design

interface SidebarProps {
    language: string
    onMobileClose?: () => void
}

interface MenuItem {
    id: string
    title: string
    icon: any
    href: string
    disabled?: boolean
}

export const Sidebar = ({ language, onMobileClose }: SidebarProps) => {
    const { personalData, reset } = useLoginStore()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const router = useRouter()
    const t = useTranslations()
    
    const name = personalData?.name ?? ''
    const icon = personalData?.icon && !personalData.icon.includes('Lawyer.jpg') ? personalData.icon : ''
    const role = Cookies.get('role')
    
    const handleLogout = () => {
        authService.logout()
        reset()
        router.push(`/${language}`)
    }

    const allMenuItems: MenuItem[] = [
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
        {
            id: 'chats',
            title: t('dashboard.sidebar.chats'),
            icon: ChatIcon,
            href: `/${language}/dashboard/chats`,
        },
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
        // Support menu item hidden per requirement
    ]

    // Контекст видео-конференций
    const pathWithoutLang = pathname.replace(/^\/[a-z]{2}/, '')
    const inVideoContext = pathWithoutLang.startsWith('/dashboard/video-conference')

    const vcMenuItems: MenuItem[] = [
        {
            id: 'vc-main',
            title: t('dashboard.sidebar.main'),
            icon: MainIcon,
            href: `/${language}`,
        },
        {
            id: 'vc-my',
            title: t('dashboard.sidebar.vcMyConferences'),
            icon: '/assets/icons/myconf.svg',
            href: `/${language}/dashboard/video-conference?view=my`,
        },
        {
            id: 'vc-feed',
            title: t('dashboard.sidebar.vcLiveFeed'),
            icon: '/assets/icons/lenta.svg',
            href: `/${language}/dashboard/video-conference?view=feed`,
        },
        {
            id: 'vc-events',
            title: t('dashboard.sidebar.vcEvents'),
            icon: '/assets/icons/event.svg',
            href: `/${language}/dashboard/video-conference?view=events`,
            disabled: true,
        },
        {
            id: 'vc-settings',
            title: t('dashboard.sidebar.vcSettings'),
            icon: '/assets/icons/settings.svg',
            href: `/${language}/dashboard/video-conference?view=settings`,
            disabled: true,
        },
        {
            id: 'faq',
            title: t('dashboard.sidebar.faq'),
            icon: FaqIcon,
            href: `/${language}/dashboard/faq`,
        },
        {
            id: 'support',
            title: t('dashboard.sidebar.support'),
            icon: SupportIcon,
            href: `/${language}/dashboard/support`,
        },
        // Support hidden globally — keep FAQ only per current design
    ]

    // Фильтруем пункты меню в зависимости от роли
    const defaultMenuItems = allMenuItems.filter(item => {
        // Подписка только для юристов
        if (role === 'client' && item.id === 'subscription') return false
        return true
    })

    const menuItems = inVideoContext ? vcMenuItems.filter(i => !['faq','support'].includes(i.id)) : defaultMenuItems

    return (
        <aside className={`${s.sidebar} ${inVideoContext ? s.vc : ''}`}>
            <div className={s.sidebarHeader}>
                <Link
                    href={`/${language}`}
                    className={s.logo}
                    onClick={onMobileClose}
                    aria-label={t('dashboard.sidebar.main')}
                >
                        <Image src="/happynewyear.svg" alt="Zanger Logo" className={s.logoIcon} width={40} height={48} priority />
                    <span className={s.logoText}>ZANGER</span>
                </Link>
                {onMobileClose && (
                    <button 
                        className={s.mobileCloseBtn}
                        onClick={onMobileClose}
                        aria-label="Закрыть меню"
                    >
                        ×
                    </button>
                )}
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
                    let isActive = false
                    if (inVideoContext) {
                        const currentView = searchParams.get('view') || 'my'
                        const isDefaultVC = pathWithoutLang === '/dashboard/video-conference' && !searchParams.get('view')
                        
                        if (item.id === 'vc-my') {
                            isActive = isDefaultVC || currentView === 'my'
                        } else if (item.id === 'vc-feed') {
                            isActive = currentView === 'feed'
                        } else if (item.id === 'vc-events') {
                            isActive = currentView === 'events'
                        } else if (item.id === 'vc-settings') {
                            isActive = currentView === 'settings'
                        } else {
                            // For other items, check pathname match
                            isActive = pathname === item.href.split('?')[0]
                        }
                    } else {
                        isActive = pathname === item.href.split('?')[0]
                    }
                    const className = `${s.navItem} ${isActive ? s.navItemActive : ''} ${item.disabled ? s.navItemDisabled : ''}`
                    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                        if (item.disabled) {
                            e.preventDefault()
                            return
                        }
                        onMobileClose?.()
                    }
                    return (
                        <Link 
                            key={item.id}
                            href={item.href}
                            className={className}
                            onClick={handleClick}
                            aria-disabled={item.disabled ? true : undefined}
                            title={item.disabled ? 'В разработке' : undefined}
                        >
                            <Image src={item.icon} alt={item.title} className={s.navIcon} width={18} height={18} />
                            <span className={s.navText}>{item.title}</span>
                        </Link>
                    )
                })}
            </nav>

            {!inVideoContext ? (
                <div className={s.sidebarFooter}>
                    <button className={s.logoutBtn} onClick={handleLogout}>
                        <span className={s.logoutText}> {t('header.logout')}</span>
                    </button>
                    <div className={s.copyright}>
                        {t('dashboard.sidebar.copyright')}
                    </div>
                </div>
            ) : (
                <div className={s.sidebarFooter}>
                    <Link href={`/${language}/dashboard/faq`} className={s.navItem}>
                        <Image src={FaqIcon} alt={t('dashboard.sidebar.faq')} className={s.navIcon} width={18} height={18} />
                        <span className={s.navText}>{t('dashboard.sidebar.faq')}</span>
                    </Link>
                    <Link href={`/${language}/dashboard/video-conference?view=settings`} className={`${s.navItem} ${s.navItemDisabled}`} aria-disabled>
                        <Image src={'/assets/icons/settings.svg'} alt={t('dashboard.sidebar.vcSettings')} className={s.navIcon} width={18} height={18} />
                        <span className={s.navText}>{t('dashboard.sidebar.vcSettings')}</span>
                    </Link>
                    <div className={s.copyright}>
                        {t('dashboard.sidebar.copyright')}
                    </div>
                </div>
            )}
        </aside>
    )
}
