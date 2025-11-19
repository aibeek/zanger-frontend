'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useLoginStore } from '@/features/auth/login'
import { ProfileAvatar } from '@/entities/profile'
import { NotificationsDropdown } from '@/entities/notifications'
import { LangSwitcher, Button, Modal } from '@/shared/ui-kit'
import Image from 'next/image'
import Cookies from 'js-cookie'
import s from './DashboardHeader.module.scss'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import monitor from '@/app/assets/icons/monitor.webp'
import HeaderAvatar from '@/app/assets/icons/header-resourses/header-avatar.svg'
import DefaultAvatar from '@/app/assets/icons/avatar-default.svg'
import Strelka from '@/app/assets/icons/strelka.svg'

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
    const [isModalOpen, setIsModalOpen] = useState(false)
    
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
            '/dashboard/video-conference': 'Видео-конференц связь',
        }

        // Удаляем язык из пути для поиска
        const pathWithoutLang = pathname.replace(/^\/[a-z]{2}/, '')
        
        return pathToTitleMap[pathWithoutLang] || 'dashboard.sidebar.main'
    }

    const sections = [
        t('dashboard.footer.sections.forum'),
        t('dashboard.footer.sections.database'),
        t('dashboard.footer.sections.seminars'),
        t('dashboard.footer.sections.digitalSignature'),
        t('dashboard.sidebar.vcMyConferences'),
        t('dashboard.footer.sections.documentManagement')
    ]
    
    const handleSectionClick = (sectionLabel: string) => {
        if (sectionLabel === t('dashboard.sidebar.vcMyConferences')) {
            if (isLawyer) {
                router.push(`/${language}/dashboard/video-conference`)
                return
            }
            setIsModalOpen(true)
            return
        }
        setIsModalOpen(true)
    }

    const pathWithoutLang = pathname.replace(/^\/[a-z]{2}/, '')
    const isVideoConferencePage = pathWithoutLang === '/dashboard/video-conference'

    const roleCode = (personalData as any)?.role_id?.code
    const roleName = roleCode === 'lawyer' ? 'Юрист' : roleCode === 'client' ? 'Клиент' : ''
    const avatarUrl = personalData?.icon || DefaultAvatar

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
                            src={HeaderAvatar} 
                            alt="Profile Icon"
                            className={s.profileIcon}
                            onClick={() => router.push(`/${language}/dashboard/profile`)}
                            width={35}
                            height={35}
                        />
                    )}
                    <h1>{t(getPageTitle())}</h1>
                </div>
                
                <div className={s.headerRight}>
                    {isVideoConferencePage && (
                        <div className={s.profileCard} onClick={() => router.push(`/${language}/dashboard/profile`)}>
                            <Image src={avatarUrl} alt="avatar" width={40} height={40} className={s.profilePic} />
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
            
            {!isVideoConferencePage && (
                <div className={s.footerSections}>
                    {sections.map((section, index) => (
                        <button 
                            key={index} 
                            className={s.footerSection}
                            onClick={() => handleSectionClick(section)}
                        >
                            <span>{section}</span>
                            <span className={s.footerArrow}>
                                <Image 
                                    src={Strelka} 
                                    alt="arrow"
                                    width={28}
                                    height={28}
                                />
                            </span>
                        </button>
                    ))}
                </div>
            )}
            
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title=""
            >
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Image
                        src={monitor}
                        alt="В разработке"
                        width={200}
                        height={150}
                        style={{ margin: '0 auto 20px' }}
                    />
                    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
                        Модули в разработке
                    </h3>
                    <Button 
                        variant="primary" 
                        onClick={() => setIsModalOpen(false)}
                        style={{ minWidth: '150px' }}
                    >
                        Понятно
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
