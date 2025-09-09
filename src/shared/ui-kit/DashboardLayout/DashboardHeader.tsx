'use client'

import { useLoginStore } from '@/features/auth/login'
import { ProfileAvatar } from '@/entities/profile'
import { LangSwitcher, Button } from '@/shared/ui-kit'
import s from './DashboardHeader.module.scss'
import { useTranslations } from 'next-intl'
interface DashboardHeaderProps {
    language: string
    title?: string
}

export const DashboardHeader = ({ language, title = 'dashboard.sidebar.profile' }: DashboardHeaderProps) => {
    const t = useTranslations()
    const { personalData } = useLoginStore()
    const icon = personalData?.icon ?? ''

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
                    <h1>{t(title)}</h1>
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
