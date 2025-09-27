'use client'

import { useEffect, useState } from 'react'
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
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

    useEffect(() => {
        getPersonalDataByToken()
    }, [getPersonalDataByToken])

    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen)
    }

    const closeMobileSidebar = () => {
        setIsMobileSidebarOpen(false)
    }

    if (loading || !personalData) {
        return <div className={s.loader}>Загрузка...</div>
    }

    return (
        <div className={s.layout}>
            {/* Mobile menu button */}
            <button 
                className={s.mobileMenuButton}
                onClick={toggleMobileSidebar}
                aria-label="Открыть меню"
            >
                <span className={s.hamburger}></span>
                <span className={s.hamburger}></span>
                <span className={s.hamburger}></span>
            </button>

            {/* Mobile overlay */}
            {isMobileSidebarOpen && (
                <div 
                    className={s.mobileOverlay}
                    onClick={closeMobileSidebar}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`${s.sidebarContainer} ${isMobileSidebarOpen ? s.mobileOpen : ''}`}>
                <Sidebar language={language} onMobileClose={closeMobileSidebar} />
            </div>

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
