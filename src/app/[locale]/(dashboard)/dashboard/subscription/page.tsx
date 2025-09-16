'use client'

import { useTranslations } from 'next-intl'
import { RightWidgets } from '../components/RightWidgets'
import s from './page.module.scss'

export default function SubscriptionPage() {
    const t = useTranslations('dashboard.subscription')

    const benefits = [
        t('benefits.0'),
        t('benefits.1'), 
        t('benefits.2'),
        t('benefits.3'),
        t('benefits.4'),
        t('benefits.5')
    ]

    return (
        <div className={s.subscriptionContent}>
            <div className={s.subscriptionMain}>
                <div className={s.header}>
                    <h1 className={s.title}>{t('title')}</h1>
                    <p className={s.subtitle}>{t('subtitle')}</p>
                </div>

                <div className={s.aboutSection}>
                    <h2 className={s.aboutTitle}>{t('aboutTitle')}</h2>
                    <p className={s.aboutText}>{t('aboutText')}</p>
                </div>

                <div className={s.benefitsSection}>
                    <h2 className={s.benefitsTitle}>{t('benefitsTitle')}</h2>
                    <div className={s.benefitsList}>
                        {benefits.map((benefit, index) => {
                            const icons = ['📋', '⚡', '📊', '💬', '🎯', '⭐']
                            const titles = [
                                'Доступ к большему количеству заявок',
                                'Возможность откликаться первыми', 
                                'Доступ к аналитике',
                                'Неограниченный чат и видеосвязь',
                                'Расширенные фильтры',
                                'Приоритетное отображение в поиске'
                            ]
                            
                            return (
                                <div key={index} className={s.benefitItem}>
                                    <div className={s.benefitIcon}>
                                        {icons[index]}
                                    </div>
                                    <div className={s.benefitContent}>
                                        <h3 className={s.benefitTitle}>
                                            {titles[index]}
                                        </h3>
                                        <p className={s.benefitDescription}>{benefit}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className={s.plansSection}>
                    <div className={s.planButtons}>
                        <button className={s.planButton}>
                            {t('plans.monthly')}
                        </button>
                        <button className={s.planButton}>
                            {t('plans.yearly')}
                        </button>
                    </div>
                </div>

                <div className={s.footer}>
                    <p 
                        className={s.footerText}
                        dangerouslySetInnerHTML={{ __html: t('agreement') }}
                    />
                    <p className={s.footerText}>
                        {t('manage')}
                    </p>
                </div>
            </div>
            
            <RightWidgets />
        </div>
    )
}
