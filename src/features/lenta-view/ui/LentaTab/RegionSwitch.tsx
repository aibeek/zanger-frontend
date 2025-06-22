'use client'

import { Switch } from '@headlessui/react'
import { useTranslations } from 'next-intl'

import s from './LentaTab.module.scss'

export const RegionSwitch = ({ value, onChange }: { value: boolean; onChange: (val: boolean) => void }) => {
	const t = useTranslations('lenta')

	return (
		<div className={s.switchWrapper}>
			<Switch
				checked={value}
				onChange={onChange}
				className={`${s.switch} ${value ? s.switchChecked : ''}`}>
				<span className={`${s.thumb} ${value ? s.thumbChecked : ''}`} />
			</Switch>
			<span className={s.switchText}>{t('regionSwitch')}</span>
		</div>
	)
}
