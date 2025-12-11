'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useLoginStore } from '@/features/auth/login'
import { NotificationsDropdown } from '@/entities/notifications'
import { LangSwitcher } from '@/shared/ui-kit'
import Image from 'next/image'
import Cookies from 'js-cookie'
import s from './DashboardHeader.module.scss'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { ModulesBar } from '@/shared/ui-kit/ModulesBar/ModulesBar'
import DefaultAvatar from '@/app/assets/icons/avatar-default.svg'
import SubscriptionIcon from '@/app/assets/icons/dashboard-icons/subscription.svg'
import FaqIcon from '@/app/assets/icons/dashboard-icons/faq.svg'
import SupportIcon from '@/app/assets/icons/dashboard-icons/support.svg'
import MainIcon from '@/app/assets/icons/dashboard-icons/Main.svg'
import ProfileIcon from '@/app/assets/icons/dashboard-icons/myprofile.svg'
import MyApplicationsIcon from '@/app/assets/icons/dashboard-icons/my-applications.svg'

interface DashboardHeaderProps {
    language: string
    title?: string
}

export const DashboardHeader = ({ language, title }: DashboardHeaderProps) => {
    const t = useTranslations()
    const router = useRouter()
    const { personalData } = useLoginStore()
    const pathname = usePathname()
    const icon = personalData?.icon ?? ''
    
    // Получаем роль пользователя из cookies
    const userRole = Cookies.get('role')
    const isLawyer = userRole === 'lawyer'
    
    // Проверяем наличие подписки у юриста
    const hasSubscription = personalData && 'lawyer' in personalData && personalData.lawyer?.subscription

    // Функция для определения заголовка на основе текущего пути
    const getPageTitle = () => {
        if (title) return title // Если передан title явно, используем его
        
        // Маппинг путей к ключам переводов
        const pathToTitleMap: Record<string, string> = {
            '/dashboard/home': 'dashboard.sidebar.main',
            '/dashboard/profile': 'dashboard.sidebar.profile',
            '/dashboard/applications': 'dashboard.sidebar.applications',
            '/dashboard/chats': 'dashboard.sidebar.chats',
            '/dashboard/subscription': 'dashboard.sidebar.subscription',
            '/dashboard/faq': 'dashboard.sidebar.faq',
            '/dashboard/support': 'dashboard.sidebar.support',
            '/dashboard/video-conference': 'dashboard.sidebar.vcMyConferences',
        }

        // Удаляем язык из пути для поиска
        const pathWithoutLang = pathname.replace(/^\/[a-z]{2}/, '')
        
        return pathToTitleMap[pathWithoutLang] || 'dashboard.sidebar.main'
    }

    // Функция для определения иконки на основе текущего пути
    const getPageIcon = () => {
        const pathWithoutLang = pathname.replace(/^\/[a-z]{2}/, '')
        
        if (pathWithoutLang.startsWith('/dashboard/profile')) return ProfileIcon
        if (pathWithoutLang.startsWith('/dashboard/applications')) return MyApplicationsIcon
        if (pathWithoutLang.startsWith('/dashboard/subscription')) return SubscriptionIcon
        if (pathWithoutLang.startsWith('/dashboard/faq')) return FaqIcon
        if (pathWithoutLang.startsWith('/dashboard/support')) return SupportIcon
        if (pathWithoutLang.startsWith('/dashboard/video-conference')) return '/assets/icons/vks.svg'
        
        return MainIcon
    }

    const pathWithoutLang = pathname.replace(/^\/[a-z]{2}/, '')
    const isVideoConferencePage = pathWithoutLang.startsWith('/dashboard/video-conference')

    const roleCode = (personalData as any)?.role_id?.code
    const roleName = roleCode === 'lawyer' ? 'Юрист' : roleCode === 'client' ? 'Клиент' : ''
    const [avatarSrc, setAvatarSrc] = useState<any>(DefaultAvatar)

    useEffect(() => {
        setAvatarSrc((personalData?.icon as any) || DefaultAvatar)
    }, [personalData])

    return (
        <div className={s.headerWrapper} suppressHydrationWarning>
            <header className={s.header}>
                <div className={s.headerLeft}>
                    {isVideoConferencePage ? (
                        <Image 
                            src="/assets/icons/vks.svg" 
                            alt="Видеоконференцсвязь"
                            className={s.profileIcon}
                            width={35}
                            height={35}
                        />
                    ) : (
                        <Image 
                            src={getPageIcon()} 
                            alt="Page Icon"
                            className={s.profileIcon}
                            width={35}
                            height={35}
                        />
                    )}
                    <h1>{t(getPageTitle())}</h1>
                </div>
                
                <div className={s.headerRight}>
                    {isVideoConferencePage && (
                        <div className={s.profileCard} onClick={() => router.push(`/${language}/dashboard/profile`)}>
                            <Image src={avatarSrc} alt="avatar" width={40} height={40} className={s.profilePic} onError={() => setAvatarSrc(DefaultAvatar)} />
                            <div className={s.profileInfo}>
                                <div className={s.profileName}>{personalData?.name}</div>
                                <div className={s.profileRole}>{roleName}</div>
                            </div>
                        </div>
                    )}
                    {isLawyer && hasSubscription && personalData && 'lawyer' in personalData && personalData.lawyer?.subscription && !isVideoConferencePage && (
                        <div className={s.subscriptionBtn}>
                            {t('header.subscriptionActive')} {new Date(personalData.lawyer.subscription.ends_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </div>
                    )}
                    
                    <NotificationsDropdown />
                    
                    <div className={s.langSwitcher}>
                        <LangSwitcher />
                    </div>
                </div>
            </header>
            
            <ModulesBar />
        </div>
    )
}
