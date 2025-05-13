'use client'

import { Switch } from '@headlessui/react'

import bell from '@/app/assets/icons/bell.svg'

import s from './ProfileNotifications.module.scss'
import { useNotificationsStore } from '../../model'
import { ProfileTabWrapper } from '../ProfileTabWrapper'
import { useTranslations } from 'next-intl'

const NOTIFICATIONS = [
	{ key: 'generalNotifications', label: 'general' },
	{ key: 'lawyerReplies', label: 'lawyerReplies' },
	{ key: 'appUpdates', label: 'appUpdates' },
] as const

export const ProfileNotifications = () => {
	const store = useNotificationsStore()
	const t = useTranslations('profile.notifications')

	return (
		<ProfileTabWrapper
			title={t('title')}
			imgSrc={bell}
			imgAlt="bell"
			panel_title={t('panelTitle')}
			panel_descr={t('panelDescription')}>
			<div className={s.notifications}>
				{NOTIFICATIONS.map(({ key, label }) => (
					<div
						key={key}
						className={s.row}>
						<span className={s.label}>{t(label)}</span>
						<Switch
							checked={store[key]}
							onChange={(value) => store.setField(key, value)}
							className={`${s.switch} ${store[key] ? s.switchChecked : ''}`}>
							<span className={`${s.thumb} ${store[key] ? s.thumbChecked : ''}`} />
						</Switch>
					</div>
				))}
			</div>
		</ProfileTabWrapper>
	)
}
