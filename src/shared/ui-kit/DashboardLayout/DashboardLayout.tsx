'use client'

import { useEffect, useState } from 'react'
import { useLoginStore } from '@/features/auth/login'
import { EcpSidebar } from '@/shared/ui-kit/EcpSidebar'
import { ApplicationsSidebar } from '@/shared/ui-kit/ApplicationsSidebar'
import { Sidebar } from '@/shared/ui-kit/Sidebar'
import { usePathname } from 'next/navigation'
import { DashboardHeader } from './DashboardHeader'
import { DashboardFooter } from './DashboardFooter'
import { EcpHeader } from '@/widgets/EcpHeader'
import { useTranslations } from 'next-intl'
import s from './DashboardLayout.module.scss'
import ApplicationsIcon from '@/app/assets/icons/dashboard-icons/my-applications.svg'

interface DashboardLayoutProps {
    children: React.ReactNode
    language: string
}

export const DashboardLayout = ({ children, language }: DashboardLayoutProps) => {
    const { personalData, getPersonalDataByToken, loading } = useLoginStore()
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
    const pathname = usePathname()
    const t = useTranslations()

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

    const isApplicationsPage = pathname.replace(/^\/[a-z]{2}/, '').startsWith('/dashboard/applications')
    const isEcpPage = pathname.replace(/^\/[a-z]{2}/, '').startsWith('/ecp')

    return (
        <div className={s.layout}>
            {/* Mobile menu button - показываем только когда сайдбар закрыт */}
            {!isMobileSidebarOpen && (
                <button 
                    className={s.mobileMenuButton}
                    onClick={toggleMobileSidebar}
                    aria-label="Открыть меню"
                >
                    <span className={s.hamburger}></span>
                    <span className={s.hamburger}></span>
                    <span className={s.hamburger}></span>
                </button>
            )}

            {/* Mobile overlay */}
            {isMobileSidebarOpen && (
                <div 
                    className={s.mobileOverlay}
                    onClick={closeMobileSidebar}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`${s.sidebarContainer} ${isMobileSidebarOpen ? s.mobileOpen : ''}`}>
                {pathname.replace(/^\/[a-z]{2}/, '').startsWith('/ecp') ? (
                    <EcpSidebar />
                ) : isApplicationsPage ? (
                    <ApplicationsSidebar onMobileClose={closeMobileSidebar} />
                ) : (
                    <Sidebar language={language} onMobileClose={closeMobileSidebar} />
                )}
            </div>

            <main className={s.mainContent}>
                {isApplicationsPage ? (
                    <EcpHeader 
                        title={t('dashboard.footer.sections.applications')} 
                        icon={ApplicationsIcon}
                    />
                ) : isEcpPage ? (
                    <EcpHeader />
                ) : (
                    <DashboardHeader language={language} />
                )}
                
                <div className={s.contentArea}>
                    {children}
                </div>
                
                {!isApplicationsPage && !isEcpPage && <DashboardFooter />}
            </main>
        </div>
    )
}
