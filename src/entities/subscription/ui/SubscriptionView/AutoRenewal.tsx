'use client'

import { Switch } from '@headlessui/react'
import s from './AutoRenewal.module.scss'
import { useSubscriptionStore } from '../../model'

export const AutoRenewal = () => {
	const enabled = useSubscriptionStore((state) => state.isAutoRenew)
	const setEnabled = useSubscriptionStore((state) => state.setAutoRenew)

	return (
		<div className={s.autoRenewalBtn}>
			<div className={s.row}>
				<span className={s.label}>Автоматическое продление</span>
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
