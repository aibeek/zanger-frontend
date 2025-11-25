'use client'

import s from './DashboardFooter.module.scss'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
    policyURL,
    policyKzURL,
    paymentURL,
    paymentKzURL,
    termsURL,
    termsKzURL,
    canselSubscriptionURL,
    canselSubscriptionKzURL
} from '@/shared/lib/consts/urls'

// Импорт иконок
import HeaderEgov from '@/app/assets/icons/header-resourses/header-egov.svg'
import HeaderAitu from '@/app/assets/icons/header-resourses/header-aitu.svg'
import HeaderAdiletGov from '@/app/assets/icons/header-resourses/header-adiletGov.svg'
import HeaderAdilet from '@/app/assets/icons/header-resourses/header-adilet.svg'
import HeaderEnotary from '@/app/assets/icons/header-resourses/header-enotary.svg'
import HeaderSupremeCourt from '@/app/assets/icons/header-resourses/header-sudcabinet.svg'
import HeaderErdr from '@/app/assets/icons/header-resourses/header-erdr.svg'
import HeaderEotinish from '@/app/assets/icons/header-resourses/header-eotinish.svg'

export const DashboardFooter = () => {
    const t = useTranslations()
    const pathname = usePathname()
    const isKz = pathname.includes('kz')
    const pathWithoutLang = pathname.replace(/^\/[a-z]{2}/, '')
    const isVideoConferencePage = pathWithoutLang.startsWith('/dashboard/video-conference')
    
    // Conditional URLs based on locale
    const policyHref = isKz ? policyKzURL : policyURL
    const paymentHref = isKz ? paymentKzURL : paymentURL
    const termsHref = isKz ? termsKzURL : termsURL
    const canselSubscriptionHref = isKz ? canselSubscriptionKzURL : canselSubscriptionURL
    
    const govServices = [
        { name: 'AITU', icon: HeaderAitu, url: 'https://aitu.io/' },
        { name: 'eGov', icon: HeaderEgov, url: 'https://egov.kz/cms/kk' },
        { name: 'eOtinish', icon: HeaderEotinish, url: 'https://eotinish.kz/kk' },
        { name: 'AdiletGov', icon: HeaderAdiletGov, url: 'https://aisoip.adilet.gov.kz/debtors' },
        { name: 'ERDR', icon: HeaderErdr, url: 'https://erdr-public.kgp.kz/' },
        { name: 'Верховный суд', icon: HeaderSupremeCourt, url: 'https://office.sud.kz/' },
        { name: 'Adilet', icon: HeaderAdilet, url: 'https://adilet.zan.kz/kaz' },
        { name: 'eNotary', icon: HeaderEnotary, url: 'https://enis.kz/?lang=kk' }
    ]
    
    if (isVideoConferencePage) {
        return null
    }
    
    return (
        <footer className={s.footer}>
            {!isVideoConferencePage && (
                <div className={s.govServicesContainer}>
                    {govServices.map((service, index) => (
                        <a 
                            key={index} 
                            href={service.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={s.govService}
                        >
                            <Image 
                                src={service.icon} 
                                alt={service.name}
                                width={64}
                                height={64}
                                className={s.govServiceIcon}
                            />
                        </a>
                    ))}
                </div>
            )}
            
            <div className={s.footerStats}>
                <div className={s.stat}>
                    <span className={s.statLabel}>{t('dashboard.footer.stats.registeredLawyers')}:</span>
                    <span className={s.statValue}></span>
                </div>
                <div className={s.stat}>
                    <span className={s.statLabel}>{t('dashboard.footer.stats.lawyersOnline')}:</span>
                    <span className={s.statValue}></span>
                </div>
                <div className={s.stat}>
                    <span className={s.statLabel}>{t('dashboard.footer.stats.totalRequests')}:</span>
                    <span className={s.statValue}></span>
                </div>
            </div>
            
            <div className={s.footerLinks}>
            <Link href={policyHref} target="_blank" className={s.footerLink}>{t('dashboard.footer.privacy')}</Link>
            <Link href={paymentHref} target="_blank" className={s.footerLink}>{t('dashboard.footer.payment')}</Link>
            <Link href={termsHref} target="_blank" className={s.footerLink}>{t('dashboard.footer.offer')}</Link>
            <Link href={canselSubscriptionHref} target="_blank" className={s.footerLink}>{t('dashboard.footer.cancellation')}</Link>
        </div>
        </footer>
    )
}
