'use client'

import clsx from 'clsx'
import { InputHTMLAttributes } from 'react'
import { Checkbox as HeadlessCheckbox } from '@headlessui/react'

import s from './Checkbox.module.scss'
import { CheckIcon } from '@heroicons/react/20/solid'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'checked'> {
	label?: string
	checked?: boolean
	onChange?: (checked: boolean) => void
	hasError?: boolean
}

export const Checkbox = ({ label, checked = false, onChange, hasError = false, className, ...props }: Props) => {
	return (
		<HeadlessCheckbox
			checked={checked}
			onChange={onChange}
			as="label"
			className={clsx(s.wrapper, className)}>
			{({ checked }) => (
				<>
					<span className={s.label}>{label}</span>
					<span
						className={clsx(s.checkbox, {
							[s.checked]: checked,
							[s.error]: hasError,
						})}>
						{checked && (
							<CheckIcon
								width={16}
								height={16}
								color={'white'}
							/>
						)}
					</span>
					<input
						type="checkbox"
						style={{ display: 'none' }}
						checked={checked}
						onChange={(e) => onChange?.(e.target.checked)}
						{...props}
					/>
				</>
			)}
		</HeadlessCheckbox>
	)
}
