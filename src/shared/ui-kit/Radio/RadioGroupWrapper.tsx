'use client'

import { RadioGroup } from '@headlessui/react'
import { ReactNode } from 'react'

interface Props {
	value: string
	onChange: (value: string) => void
	children: ReactNode
	className?: string
}

export const RadioGroupWrapper = ({ value, onChange, className, children }: Props) => {
	return (
		<RadioGroup
			className={className}
			value={value}
			onChange={onChange}>
			{children}
		</RadioGroup>
	)
}
