'use client'

import { useTranslations } from 'next-intl'
import { CreateApplicationForm } from '@/features/create-application'
import s from './ApplicationTab.module.scss'

export const ApplicationTab = () => {
	const t = useTranslations('createApplications')

	return (
		<section className={s.wrapper}>
			<div className={s.inner}>
				<h4 className={s.title}>{t('title')}</h4>
				<CreateApplicationForm />
			</div>
		</section>
	)
}
