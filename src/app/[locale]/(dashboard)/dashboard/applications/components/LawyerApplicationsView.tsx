'use client'

import { useTranslations } from 'next-intl'
import { LentaTab } from '@/features/lenta-view'
import { MyResponsesTab } from '@/features/my-responses-view'
import s from './LawyerApplicationsView.module.scss'

export const LawyerApplicationsView = () => {
	const t = useTranslations()

	return (
		<div className={s.container}>
			<div className={s.leftColumn}>
				<div className={s.section}>
					<h2 className={s.sectionTitle}>
						{t('applications.newApplications')}
					</h2>
					<LentaTab />
				</div>
			</div>
			
			<div className={s.rightColumn}>
				<div className={s.section}>
					<h2 className={s.sectionTitle}>
						{t('applications.myApplications')}
					</h2>
					<MyResponsesTab />
				</div>
			</div>
		</div>
	)
}
