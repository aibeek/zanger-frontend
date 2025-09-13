'use client'

import { usePathname } from 'next/navigation'
import { useLoginStore } from '@/features/auth/login'
import { ProfileAvatar } from '@/entities/profile'
import { NotificationsDropdown } from '@/entities/notifications'
import { LangSwitcher, Button } from '@/shared/ui-kit'
import Image from 'next/image'
import s from './DashboardHeader.module.scss'
import { useTranslations } from 'next-intl'

// Импорт иконок
import HeaderEgov from '@/app/assets/icons/header-resourses/header-egov.svg'
import HeaderAitu from '@/app/assets/icons/header-resourses/header-aitu.svg'
import HeaderAdiletGov from '@/app/assets/icons/header-resourses/header-adiletGov.svg'
import HeaderAdilet from '@/app/assets/icons/header-resourses/header-adilet.svg'
import HeaderEnotary from '@/app/assets/icons/header-resourses/header-enotary.svg'
import HeaderContract24 from '@/app/assets/icons/header-resourses/header-договор24.svg'
import HeaderSupremeCourt from '@/app/assets/icons/header-resourses/header-верховный-суд.svg'
import HeaderLe from '@/app/assets/icons/header-resourses/header-le.svg'
import HeaderErdr from '@/app/assets/icons/header-resourses/header-erdr.svg'
import HeaderEotinish from '@/app/assets/icons/header-resourses/header-eotinish.svg'
import HeaderAvatar from '@/app/assets/icons/header-resourses/header-avatar.svg'
interface DashboardHeaderProps {
    language: string
    title?: string
}

export const DashboardHeader = ({ language, title }: DashboardHeaderProps) => {
    const t = useTranslations()
    const { personalData } = useLoginStore()
    const pathname = usePathname()
    const icon = personalData?.icon ?? ''

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
        }

        // Удаляем язык из пути для поиска
        const pathWithoutLang = pathname.replace(/^\/[a-z]{2}/, '')
        
        return pathToTitleMap[pathWithoutLang] || 'dashboard.sidebar.main'
    }

    const govServices = [
        { name: 'AITU', icon: HeaderAitu },
        { name: 'eGov', icon: HeaderEgov },
        { name: 'eOtinish', icon: HeaderEotinish },
        { name: 'AdiletGov', icon: HeaderAdiletGov },
        { name: 'ERDR', icon: HeaderErdr },
        { name: 'LE', icon: HeaderLe },
        { name: 'Верховный суд', icon: HeaderSupremeCourt },
        { name: 'Договор24', icon: HeaderContract24 },
        { name: 'Adilet', icon: HeaderAdilet },
        { name: 'eNotary', icon: HeaderEnotary }
    ]

    return (
        <div className={s.headerWrapper}>
            <header className={s.header}>
                <div className={s.headerLeft}>
                    <Image 
                        src={HeaderAvatar} 
                        alt="Profile Icon"
                        className={s.profileIcon}
                    />
                    <h1>{t(getPageTitle())}</h1>
                </div>
                
                <div className={s.headerRight}>
                    <Button variant="primary" className={s.subscriptionBtn}>
                        {t('dashboard.sidebar.subscription')}
                    </Button>
                    
                    <NotificationsDropdown />
                    
                    <div className={s.langSwitcher}>
                        <LangSwitcher />
                    </div>
                </div>
            </header>
            
            <div className={s.govServicesContainer}>
                {govServices.map((service, index) => (
                    <div key={index} className={s.govService}>
                        <Image 
                            src={service.icon} 
                            alt={service.name}
                            width={64}
                            height={64}
                            className={s.govServiceIcon}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
