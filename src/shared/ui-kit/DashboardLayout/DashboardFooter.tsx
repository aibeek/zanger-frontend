'use client'

import s from './DashboardFooter.module.scss'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { usePathname } from 'next/navigation'
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

export const DashboardFooter = () => {
    const t = useTranslations()
    const pathname = usePathname()
    const isKz = pathname.includes('kz')
    
    // Conditional URLs based on locale
    const policyHref = isKz ? policyKzURL : policyURL
    const paymentHref = isKz ? paymentKzURL : paymentURL
    const termsHref = isKz ? termsKzURL : termsURL
    const canselSubscriptionHref = isKz ? canselSubscriptionKzURL : canselSubscriptionURL
    
    const sections = [
        t('dashboard.footer.sections.forum'),
        t('dashboard.footer.sections.database'),
        t('dashboard.footer.sections.seminars'),
        t('dashboard.footer.sections.digitalSignature'),
        t('dashboard.footer.sections.videoConference'),
        t('dashboard.footer.sections.documentManagement')
    ]
    
    return (
        <footer className={s.footer}>
            <div className={s.footerSections}>
                {sections.map((section, index) => (
                    <button key={index} className={s.footerSection}>
                        <span>{section}</span>
                        <span className={s.footerArrow}>→</span>
                    </button>
                ))}
            </div>
            
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
