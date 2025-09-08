'use client'

import { useEffect } from 'react'
import { useLoginStore } from '@/features/auth/login'
import { Sidebar } from '@/shared/ui-kit/Sidebar'
import { DashboardHeader } from './DashboardHeader'
import { DashboardFooter } from './DashboardFooter'
import s from './DashboardLayout.module.scss'

interface DashboardLayoutProps {
    children: React.ReactNode
    language: string
}

export const DashboardLayout = ({ children, language }: DashboardLayoutProps) => {
    const { personalData, getPersonalDataByToken, loading } = useLoginStore()

    useEffect(() => {
        getPersonalDataByToken()
    }, [getPersonalDataByToken])

    if (loading || !personalData) {
        return <div className={s.loader}>Загрузка...</div>
    }

    return (
        <div className={s.layout}>
            <Sidebar language={language} />
            
            <main className={s.mainContent}>
                <DashboardHeader language={language} />
                
                <div className={s.contentArea}>
                    {children}
                </div>
                
                <DashboardFooter />
            </main>
        </div>
    )
}
