'use client'

import { useEffect, useMemo, useState } from 'react'
import Cookies from 'js-cookie'
import { ClientApplicationsView, LawyerApplicationsView } from './components'
import { RightWidgets } from '../components/RightWidgets'
import { Loader } from '@/shared/ui-kit'
import s from './page.module.scss'
import { useLoginStore } from '@/features/auth/login'
import { useLentaAccessStatus } from '@/shared/lib/hooks/useLentaAccessStatus'
import Link from 'next/link'

export default function ApplicationsPage() {
    const [role, setRole] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const personalData = useLoginStore((s) => s.personalData)
    const { needsDocuments, hasModerationDocs } = useLentaAccessStatus()
    const hasSubscription = useMemo(() => {
        const pd = personalData as any
        return pd && 'lawyer' in pd && pd.lawyer?.subscription
    }, [personalData])
    const language = useMemo(() => (personalData as any)?.language || 'ru', [personalData])

	useEffect(() => {
		const userRole = Cookies.get('role')
		setRole(userRole || null)
		setIsLoading(false)
	}, [])

    if (isLoading) {
        return (
            <div className={s.page}>
                <Loader />
            </div>
        )
    }

    const canAccess = role === 'lawyer' ? !!hasSubscription && !needsDocuments && !hasModerationDocs : true

    return (
        <div className={s.page}>
            <div className={s.content}>
                {role === 'client' && <ClientApplicationsView />}
                {role === 'lawyer' && !canAccess && (
                    <div className={s.accessBanner}>
                        <div className={s.bannerIcon}>ℹ️</div>
                        <div className={s.bannerContent}>
                            <h4 className={s.bannerTitle}>Доступ к заявкам закрыт</h4>
                            <p className={s.bannerDescription}>Для открытия раздела выполните условия:</p>
                            <ul className={s.bannerList}>
                                {!hasSubscription && (
                                    <li>Оплатите подписку</li>
                                )}
                                {(needsDocuments || hasModerationDocs) && (
                                    <li>{hasModerationDocs ? 'Дождитесь проверки документов администратором' : 'Загрузите обязательные документы и отправьте на проверку'}</li>
                                )}
                            </ul>
                            <div className={s.bannerActions}>
                                {!hasSubscription && (
                                    <Link className={s.primaryBtn} href={`/${language}/dashboard/subscription`}>Оформить подписку</Link>
                                )}
                                {(needsDocuments || hasModerationDocs) && (
                                    <Link className={s.secondaryBtn} href={`/${language}/dashboard/profile`}>Перейти в профиль</Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {role === 'lawyer' && canAccess && <LawyerApplicationsView />}
            </div>
            <RightWidgets />
        </div>
    )
}
