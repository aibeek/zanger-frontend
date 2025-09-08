import Link from 'next/link'
import s from './DashboardFooter.module.scss'
import { useTranslations } from 'next-intl'

export const DashboardFooter = () => {
    const t = useTranslations()
    return (
        <footer className={s.footer}>
            <div className={s.footerSections}>
                {[
                    'Форум', 'База данных', 'Семинары', 'ЭЦП', 
                    'Видео-конференц связь', 'Управление документами'
                ].map((section, index) => (
                    <button key={index} className={s.footerSection}>
                        <span>{section}</span>
                        <span className={s.footerArrow}>→</span>
                    </button>
                ))}
            </div>
            
            <div className={s.footerStats}>
                <div className={s.stat}>
                    <span className={s.statLabel}>Зарегистрировано юристов:</span>
                    <span className={s.statValue}>10 254</span>
                </div>
                <div className={s.stat}>
                    <span className={s.statLabel}>Юристов онлайн:</span>
                    <span className={s.statValue}>5 632</span>
                </div>
                <div className={s.stat}>
                    <span className={s.statLabel}>Всего заявок:</span>
                    <span className={s.statValue}>8 129</span>
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
