'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { LawyerApplicationsList } from './LawyerApplicationsList'
import { MyResponsesTab } from '@/features/my-responses-view'
import s from './LawyerApplicationsView.module.scss'
import clsx from 'clsx'

export const LawyerApplicationsView = () => {
	const t = useTranslations()
	const [activeTab, setActiveTab] = useState<'new' | 'my'>('new')

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
			</div>

			<div className={s.content}>
				{activeTab === 'new' ? (
					<LawyerApplicationsList />
				) : (
					<MyResponsesTab />
				)}
			</div>
		</div>
	)
}
