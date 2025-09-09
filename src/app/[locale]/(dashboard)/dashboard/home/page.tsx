'use client'

import { useTranslations } from 'next-intl'
import { DashboardHeader } from '@/shared/ui-kit/DashboardLayout'

export default function HomePage() {
    const t = useTranslations()
    
    return (
        <div>
            <h1>{t('dashboard.home.title')}</h1>
            <p>{t('dashboard.home.description')}</p>
        </div>
    )
}
