'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useLoginStore } from '@/features/auth/login'
import { RightWidgets } from '../components/RightWidgets'
import { lawyerApi } from '@/shared/api'
import type { SubscriptionPlanRaw } from '@/shared/api/lawyerApi'
import { toast } from 'react-hot-toast'
import s from './page.module.scss'

export default function SubscriptionPage() {
    const t = useTranslations('dashboard.subscription')
    const { personalData } = useLoginStore()

    const benefits = [
        {
            icon: '📋',
            title: t('benefitTitles.0'),
            description: t('benefits.0')
        },
        {
            icon: '⚡',
            title: t('benefitTitles.1'),
            description: t('benefits.1')
        },
        {
            icon: '📊',
            title: t('benefitTitles.2'),
            description: t('benefits.2')
        },
        {
            icon: '💬',
            title: t('benefitTitles.3'),
            description: t('benefits.3')
        },
        {
            icon: '🎯',
            title: t('benefitTitles.4'),
            description: t('benefits.4')
        },
        {
            icon: '⭐',
            title: t('benefitTitles.5'),
            description: t('benefits.5')
        }
    ]

    const [plans, setPlans] = useState<SubscriptionPlanRaw[] | null>(null)
    const [loading, setLoading] = useState<boolean>(false)

    // Проверяем наличие подписки
    const hasSubscription = personalData && 'lawyer' in personalData && personalData.lawyer?.subscription
    const subscription = hasSubscription ? personalData.lawyer?.subscription : null

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

    const monthlyPlanId = 2

    const handleSubscribe = async () => {
        const plan = monthlyPlanId ? plans?.find(p => p.id === monthlyPlanId) : null
        if (!plan) {
            toast.error('Тариф не найден')
            return
        }

        setLoading(true)
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
            setLoading(false)
        }
    }

    const handleExtend = async () => {
        // Продление = создание новой подписки (такой же логикой как при первой подписке)
        const plan = monthlyPlanId ? plans?.find(p => p.id === monthlyPlanId) : null
        if (!plan) {
            toast.error('Тариф не найден')
            return
        }

        setLoading(true)
        try {
            const res = await lawyerApi.subscribe(plan.id, true)
            if (res?.link) {
                window.location.href = res.link
                return
            }
            toast.success(res?.message || 'Запрос на продление создан')
        } catch (e: any) {
            toast.error(e?.message || 'Не удалось продлить подписку')
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = async () => {
        // Отмена подписки = отключение автопродления
        if (window.confirm('Вы уверены, что хотите отменить автопродление подписки? Подписка будет действовать до конца оплаченного периода.')) {
            setLoading(true)
            try {
                await lawyerApi.setAutoRenew(0)
                toast.success('Автопродление подписки отключено. Подписка будет действовать до ' + 
                    new Date(subscription!.ends_at).toLocaleDateString('ru-RU'))
                // Обновляем данные пользователя
                window.location.reload()
            } catch (e: any) {
                toast.error(e?.message || 'Не удалось отменить подписку')
            } finally {
                setLoading(false)
            }
        }
    }

    // Если есть подписка - показываем информацию о ней
    if (hasSubscription && subscription) {
        return (
            <div className={s.subscriptionContent}>
                <div className={s.subscriptionMain}>
                    <div className={s.activeSubscriptionCard}>
                        <div className={s.cardHeader}>
                            <h2>{t('yourSubscription')}</h2>
                            <div className={s.badge}>
                                {t('activeUntil')} {new Date(subscription.ends_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </div>
                        </div>

                        <div className={s.benefitsTitle}>
                            <h3>{t('withSubscription')}</h3>
                        </div>

                        <div className={s.benefitsGrid}>
                            <div className={s.column}>
                                {benefits.slice(0, 3).map((benefit, index) => (
                                    <div key={index} className={s.benefitItemCard}>
                                        <div className={s.benefitIconCard}>{benefit.icon}</div>
                                        <div className={s.benefitContentCard}>
                                            <h4>{benefit.title}</h4>
                                            <p>{benefit.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className={s.column}>
                                {benefits.slice(3).map((benefit, index) => (
                                    <div key={index} className={s.benefitItemCard}>
                                        <div className={s.benefitIconCard}>{benefit.icon}</div>
                                        <div className={s.benefitContentCard}>
                                            <h4>{benefit.title}</h4>
                                            <p>{benefit.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={s.actions}>
                            <button className={s.extendButton} onClick={handleExtend} disabled={loading}>
                                {loading ? 'Загрузка...' : t('extendButton')}
                            </button>
                            <button className={s.cancelButton} onClick={handleCancel} disabled={loading}>
                                {t('cancelButton')}
                            </button>
                        </div>
                    </div>
                </div>
                
                <RightWidgets />
            </div>
        )
    }

    // Если нет подписки - показываем форму оформления
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
                        {benefits.map((benefit, index) => (
                            <div key={index} className={s.benefitItem}>
                                <div className={s.benefitIcon}>
                                    {benefit.icon}
                                </div>
                                <div className={s.benefitContent}>
                                    <h3 className={s.benefitTitle}>
                                        {benefit.title}
                                    </h3>
                                    <p className={s.benefitDescription}>{benefit.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={s.plansSection}>
                    <div className={s.planButtons}>
                        <button
                            className={s.planButton}
                            disabled={loading}
                            onClick={handleSubscribe}
                        >
                            {t('plans.monthly')}
                        </button>
                    </div>
                </div>

                <div className={s.footer}>
                    <p 
                        className={s.footerText}
                        dangerouslySetInnerHTML={{ __html: t.raw('agreement') }}
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
