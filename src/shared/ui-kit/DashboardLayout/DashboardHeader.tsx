'use client'

import { usePathname } from 'next/navigation'
import { useLoginStore } from '@/features/auth/login'
import { ProfileAvatar } from '@/entities/profile'
import { LangSwitcher, Button } from '@/shared/ui-kit'
import s from './DashboardHeader.module.scss'
import { useTranslations } from 'next-intl'
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
        { name: 'AITU' },
        { name: 'eGov' },
        { name: 'eOtinish' },
        { name: 'AdiletGov' },
        { name: 'EBKM' },
        { name: 'LF' },
        { name: 'Qamqorgao' },
        { name: 'Kasipkor' },
        { name: 'QazTrade' },
        { name: 'Notary' }
    ]

    return (
        <div className={s.headerWrapper}>
            <header className={s.header}>
                <div className={s.headerLeft}>
                    <h1>{t(getPageTitle())}</h1>
                </div>
                
                <div className={s.headerRight}>
                      <Button variant="primary" className={s.subscriptionBtn}>
                        {t('dashboard.sidebar.subscription')}
                    </Button>
                    
                    <div className={s.langSwitcher}>
                        <LangSwitcher />
                    </div>
                </div>
            </header>
            
            <div className={s.govServicesContainer}>
                {govServices.map((service, index) => (
                    <div key={index} className={s.govService}>
                        <span className={s.govServiceText}>{service.name}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
