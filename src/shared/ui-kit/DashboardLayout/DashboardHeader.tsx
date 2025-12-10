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
import { useState, useEffect } from 'react'
import monitor from '@/app/assets/icons/monitor.webp'
import HeaderAvatar from '@/app/assets/icons/header-resourses/header-avatar.svg'
import DefaultAvatar from '@/app/assets/icons/avatar-default.svg'
import docIcon from '@/app/assets/icons/document.svg'
import MyApplicationsIcon from '@/app/assets/icons/dashboard-icons/my-applications.svg'
import chatIcon from '@/app/assets/icons/dashboard-icons/chat.svg'
import moduleIcon from '@/app/assets/icons/moduleIcon.svg'
import communityIcon from '@/app/assets/icons/people.svg'
import crmIcon from '@/app/assets/icons/phone.svg'
import seminarIcon from '@/app/assets/icons/document.svg'
import verifyIcon from '@/app/assets/icons/sheet-alert.svg'
import { Search } from 'lucide-react'

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
            '/dashboard/video-conference': 'dashboard.sidebar.vcMyConferences',
        }

        // Удаляем язык из пути для поиска
        const pathWithoutLang = pathname.replace(/^\/[a-z]{2}/, '')
        
        return pathToTitleMap[pathWithoutLang] || 'dashboard.sidebar.main'
    }

    const sections = [
        t('dashboard.footer.sections.applications'),
        t('dashboard.footer.sections.digitalSignature'),
        t('dashboard.footer.sections.aiConsultant'),
        t('dashboard.footer.sections.videoConference'),
        'Сообщество',
        'CRM',
        'Семинары',
        t('dashboard.footer.sections.database')
    ]

    const digitalSignatureLabel = t('dashboard.footer.sections.digitalSignature')
    const applicationsLabel = t('dashboard.footer.sections.applications')
    const videoConferenceLabel = t('dashboard.footer.sections.videoConference')
    const aiConsultantLabel = t('dashboard.footer.sections.aiConsultant')
    const databaseLabel = t('dashboard.footer.sections.database')

    const handleSectionClick = (label: string) => {
        if (label === digitalSignatureLabel) {
            router.push(`/${language}/ecp/statuses`)
            return
        }
        if (label === applicationsLabel) {
            router.push(`/${language}/dashboard/applications`)
            return
        }
        if (label === aiConsultantLabel) {
            router.push(`/${language}/dashboard/ai-consultant`)
            return
        }
        setIsModalOpen(true)
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
            
            <div className={s.footerSections}>
                    {sections.map((section, index) => {
                        const isPilot = section === videoConferenceLabel
                        const isDigital = section === digitalSignatureLabel
                        const isApplications = section === applicationsLabel
                        const isAi = section === aiConsultantLabel
                        const isDatabase = section === databaseLabel
                        const isCommunity = section === 'Сообщество'
                        const isCRM = section === 'CRM'
                        const isSeminars = section === 'Семинары'
                        const label = section === databaseLabel ? 'Проверка КГ' : section
                        return (
                        <button 
                            key={index} 
                            className={`${s.footerSection} ${(isDigital || isApplications || isAi) ? s.footerSectionEdo : ''}`}
                            onClick={() => handleSectionClick(section)}
                        >
                            <span className={s.footerLabel}>
                                {isDigital && (
                                    <span className={s.footerDocIcon} aria-hidden>
                                        <Image src={docIcon} alt="doc" width={26} height={26} />
                                    </span>
                                )}
                                {isPilot && (
                                    <span className={s.footerDocIcon} aria-hidden>
                                        <Image src="/assets/icons/vks.svg" alt="vks" width={26} height={26} />
                                    </span>
                                )}
                                {isApplications && (
                                    <span className={s.footerDocIcon} aria-hidden>
                                        <Image src={MyApplicationsIcon} alt="applications" width={26} height={26} />
                                    </span>
                                )}
                                {isAi && (
                                    <span className={s.footerDocIcon} aria-hidden>
                                        <Image src={chatIcon} alt="ai" width={26} height={26} />
                                    </span>
                                )}
                                {(isCommunity || isCRM || isSeminars || isDatabase) && (
                                    <span className={s.footerDocIcon} aria-hidden>
                                        {isDatabase ? (
                                            <Search size={24} color="#fff" />
                                        ) : (
                                            <Image src={
                                                isCommunity ? communityIcon :
                                                isCRM ? crmIcon :
                                                isSeminars ? seminarIcon :
                                                moduleIcon
                                            } alt="icon" width={26} height={26} />
                                        )}
                                    </span>
                                )}
                                {label}
                                {/* Пилот метка убрана */}
                            </span>
                        </button>
                    )})}
            </div>
            
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
