'use client'

import { useTranslations } from 'next-intl'
import { CreateApplicationForm } from '@/features/create-application'
import { MyApplicationsTab } from '@/features/my-applications-view'
import s from './ClientApplicationsView.module.scss'

export const ClientApplicationsView = () => {
	const t = useTranslations()

	return (
		<div className={s.container}>
			<div className={s.leftColumn}>
				<div className={s.section}>
					<h2 className={s.sectionTitle}>
						{t('applications.createNew')}
					</h2>
					<CreateApplicationForm />
				</div>
			</div>
			
			<div className={s.rightColumn}>
				<div className={s.section}>
					<h2 className={s.sectionTitle}>
						{t('applications.myApplications')}
					</h2>
					<MyApplicationsTab />
				</div>
			</div>
		</div>
	)
}
