'use client'

import clsx from 'clsx'
import { RadioGroup } from '@headlessui/react'

import s from './RadioGroup.module.scss'

interface Props {
	label: string
	value: string
	hasError?: boolean
}

export const RadioGroupItem = ({ label, value, hasError = false }: Props) => {
	return (
		<RadioGroup.Option value={value}>
			{({ checked }) => (
				<div className={clsx(s.wrapper)}>
					<span className={s.label}>{label}</span>
					<span
						className={clsx(s.radio, {
							[s.checked]: checked,
							[s.error]: hasError,
						})}
					/>
				</div>
			)}
		</RadioGroup.Option>
	)
}
