'use client'

import { Switch } from '@headlessui/react'
import s from './AutoRenewal.module.scss'
import { useSubscriptionStore } from '../../model'
import { useTranslations } from 'next-intl'

export const AutoRenewal = () => {
	const enabled = useSubscriptionStore((state) => state.isAutoRenew)
	const setEnabled = useSubscriptionStore((state) => state.setAutoRenew)
	const t = useTranslations('subscriptionView')

	return (
		<div className={s.autoRenewalBtn}>
			<div className={s.row}>
				<span className={s.label}>{t('autoRenewal')}</span>
				<Switch
					checked={enabled}
					onChange={setEnabled}
					className={`${s.switch} ${enabled ? s.switchChecked : ''}`}>
					<span className={`${s.thumb} ${enabled ? s.thumbChecked : ''}`} />
				</Switch>
			</div>
		</div>
	)
}
