'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { RightWidgets } from '../components/RightWidgets'
import { lawyerApi } from '@/shared/api'
import type { SubscriptionPlanRaw } from '@/shared/api/lawyerApi'
import { toast } from 'react-hot-toast'
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

    const [plans, setPlans] = useState<SubscriptionPlanRaw[] | null>(null)
    const [loading, setLoading] = useState<null | 'monthly' | 'yearly'>(null)

    useEffect(() => {
        let mounted = true
        ;(async () => {
            try {
                const res = await lawyerApi.getAllSubscriptionPlans()
                if (!mounted) return
                setPlans(res?.data || [])
            } catch (e: any) {
                if (!mounted) return
                toast.error(e?.message || 'Не удалось загрузить тарифы')
            }
        })()
        return () => { mounted = false }
    }, [])

    const monthlyPlan = useMemo(() => plans?.find(p => p.duration_months === 1) || null, [plans])
    const yearlyPlan = useMemo(() => plans?.find(p => p.duration_months === 12) || null, [plans])

    const handleSubscribe = async (type: 'monthly' | 'yearly') => {
        const plan = type === 'monthly' ? monthlyPlan : yearlyPlan
        if (!plan) {
            toast.error('Тариф не найден')
            return
        }

        setLoading(type)
        try {
            const res = await lawyerApi.subscribe(plan.id, true)
            if (res?.link) {
                window.location.href = res.link
                return
            }
            toast.success(res?.message || 'Запрос на подписку создан')
        } catch (e: any) {
            toast.error(e?.message || 'Не удалось оформить подписку')
        } finally {
            setLoading(null)
        }
    }

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
                        <button
                            className={s.planButton}
                            disabled={loading === 'monthly'}
                            onClick={() => handleSubscribe('monthly')}
                        >
                            {t('plans.monthly')}
                        </button>
                        <button
                            className={s.planButton}
                            disabled={loading === 'yearly'}
                            onClick={() => handleSubscribe('yearly')}
                        >
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
