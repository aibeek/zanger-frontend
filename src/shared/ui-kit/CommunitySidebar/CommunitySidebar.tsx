'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { useTranslations } from 'next-intl'
import { useLoginStore } from '@/features/auth/login'
import { authService } from '@/features/auth/login/service'
import { ProfileAvatar } from '@/entities/profile'
import s from './CommunitySidebar.module.scss'

// Icons
import {
    User,
    Newspaper,
    HelpCircle,
    UserPlus,
    Radio,
    MessageSquare,
    BookOpen,
    Calendar,
    HeadphonesIcon
} from 'lucide-react'

interface CommunitySidebarProps {
    language: string
    onMobileClose?: () => void
}

interface MenuItem {
    id: string
    title: string
    icon: React.ReactNode
    href: string
    disabled?: boolean
}

export const CommunitySidebar = ({ language, onMobileClose }: CommunitySidebarProps) => {
    const { personalData, reset } = useLoginStore()
    const pathname = usePathname()
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

    const menuItems: MenuItem[] = [
        {
            id: 'profile',
            title: 'Мой профиль',
            icon: <User size={20} />,
            href: `/${language}/community/profile`,
        },
        {
            id: 'feed',
            title: 'Лента',
            icon: <Newspaper size={20} />,
            href: `/${language}/community/feed`,
        },
        {
            id: 'qa',
            title: 'Вопросы и ответы',
            icon: <HelpCircle size={20} />,
            href: `/${language}/community/qa`,
        },
        {
            id: 'colleagues',
            title: 'Поиск коллег',
            icon: <UserPlus size={20} />,
            href: `/${language}/community/colleagues`,
        },
        {
            id: 'zanger-talk',
            title: 'ZANGER talk',
            icon: <Radio size={20} />,
            href: `/${language}/community/zanger-talk`,
        },
        {
            id: 'chats',
            title: 'Чаты',
            icon: <MessageSquare size={20} />,
            href: `/${language}/community/chats`,
        },
        {
            id: 'knowledge-base',
            title: 'База знаний',
            icon: <BookOpen size={20} />,
            href: `/${language}/community/knowledge-base`,
        },
        {
            id: 'events',
            title: 'Мероприятия',
            icon: <Calendar size={20} />,
            href: `/${language}/community/events`,
        },
        {
            id: 'support',
            title: 'Тех.поддержка',
            icon: <HeadphonesIcon size={20} />,
            href: `/${language}/community/support`,
        },
    ]

    return (
        <aside className={s.sidebar}>
            <div className={s.sidebarHeader}>
                <Link
                    href={`/${language}`}
                    className={s.logo}
                    onClick={onMobileClose}
                    aria-label="Главная"
                >
                    <Image
                        src="/logo.svg"
                        alt="Zanger Logo"
                        className={s.logoIcon}
                        width={40}
                        height={48}
                        priority
                    />
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
                    const pathWithoutLang = pathname.replace(/^\/[a-z]{2}/, '')
                    const hrefWithoutLang = item.href.replace(/^\/[a-z]{2}/, '')
                    const isActive = pathWithoutLang === hrefWithoutLang ||
                        pathWithoutLang.startsWith(hrefWithoutLang + '/')

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
                            <span className={s.navIcon}>{item.icon}</span>
                            <span className={s.navText}>{item.title}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className={s.sidebarFooter}>
                <button className={s.logoutBtn} onClick={handleLogout}>
                    <span className={s.logoutText}>{t('header.logout')}</span>
                </button>
                <div className={s.copyright}>
                    {t('dashboard.sidebar.copyright')}
                </div>
            </div>
        </aside>
    )
}
