'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { LawyerApplicationsList } from './LawyerApplicationsList'
import { MyResponsesTab, ArchivedResponsesTab } from '@/features/my-responses-view'
import s from './LawyerApplicationsView.module.scss'
import clsx from 'clsx'

export const LawyerApplicationsView = () => {
    const t = useTranslations()
    const searchParams = useSearchParams()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'new' | 'my' | 'archived'>('new')

    useEffect(() => {
        const tab = searchParams?.get('tab')
        if (tab === 'my' || tab === 'new' || tab === 'archived') {
            setActiveTab(tab)
        }
    }, [searchParams])

	return (
		<div className={s.container}>
			<div className={s.tabsHeader}>
                <button 
                    className={clsx(s.tabBtn, activeTab === 'new' && s.active)}
                    onClick={() => setActiveTab('new')}
                >
                    {t('applications.newApplications')}
                </button>
                <button 
                    className={clsx(s.tabBtn, activeTab === 'my' && s.active)}
                    onClick={() => setActiveTab('my')}
                >
                    {t('applications.myApplications')}
                </button>
                <button 
                    className={clsx(s.tabBtn, activeTab === 'archived' && s.active)}
                    onClick={() => setActiveTab('archived')}
                >
                    {t('applications.archivedApplications')}
                </button>
			</div>

			<div className={s.content}>
				{activeTab === 'new' ? (
					<LawyerApplicationsList />
				) : activeTab === 'my' ? (
					<MyResponsesTab />
				) : (
					<ArchivedResponsesTab />
				)}
			</div>
		</div>
	)
}
