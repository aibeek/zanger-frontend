'use client'

import { forwardRef, InputHTMLAttributes, useState } from 'react'
import clsx from 'clsx'
import s from './Input.module.scss'
import { Input as CustomedInput } from '@headlessui/react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/20/solid'
import { Button } from '../Button'

type Variant = 'primary' | 'secondary' | 'otp'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
	variant?: Variant
	hasError?: boolean
	as?: typeof CustomedInput
	icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, Props>(
	({ className, variant = 'primary', hasError = false, as: Component = CustomedInput, type, ...props }, ref) => {
		const [showPassword, setShowPassword] = useState(false)
		const isPasswordType = type === 'password'

		return (
			<div className={clsx(s.wrapper, 'relative')}>
				<Component
					ref={ref}
					type={isPasswordType && showPassword ? 'text' : type}
					className={clsx(s.input, s[variant], { [s.error]: hasError }, className)}
					{...props}
				/>
				{isPasswordType && (
					<Button
						variant={'clear'}
						type="button"
						onClick={() => setShowPassword((prev) => !prev)}>
						{showPassword ? <EyeSlashIcon /> : <EyeIcon />}
					</Button>
				)}
			</div>
		)
	},
)

Input.displayName = 'Input'
