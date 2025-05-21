'use client'

import { RadioGroup } from '@headlessui/react'
import { ReactNode } from 'react'

interface Props {
	value: string
	onChange: (value: string) => void
	children: ReactNode
}

export const RadioGroupWrapper = ({ value, onChange, children }: Props) => {
	return (
		<RadioGroup
			value={value}
			onChange={onChange}>
			{children}
		</RadioGroup>
	)
}
