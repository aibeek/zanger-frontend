'use client'

import clsx from 'clsx'
import { RadioGroup } from '@headlessui/react'
import s from './RadioGroup.module.scss'
import { ReactNode } from 'react'

interface Props {
	label: ReactNode
	value: string
	hasError?: boolean
}

export const RadioGroupItem = ({ label, value, hasError = false }: Props) => {
	return (
		<RadioGroup.Option value={value}>
			{({ checked }) => <div className={clsx(s.wrapper, { [s.checked]: checked, [s.error]: hasError })}>{label}</div>}
		</RadioGroup.Option>
	)
}
