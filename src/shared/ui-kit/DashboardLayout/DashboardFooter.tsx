import Link from 'next/link'
import s from './DashboardFooter.module.scss'
import { useTranslations } from 'next-intl'

export const DashboardFooter = () => {
    const t = useTranslations()
    
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
            <Link href="/privacy" className={s.footerLink}>{t('dashboard.footer.privacy')}</Link>
            <Link href="/payment" className={s.footerLink}>{t('dashboard.footer.payment')}</Link>
            <Link href="/offer" className={s.footerLink}>{t('dashboard.footer.offer')}</Link>
            <Link href="/cancellation" className={s.footerLink}>{t('dashboard.footer.cancellation')}</Link>
        </div>
        </footer>
    )
}
