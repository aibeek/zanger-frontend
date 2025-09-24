'use client'

import { useEffect } from 'react'
import { redirect, useParams } from 'next/navigation'

import { useStepMarcher } from '@/shared/lib'
import { EnterNewPasswordStep } from '@/features/auth'
import { EnterPhoneNumberStep } from '@/widgets/EnterPhoneNumberStep'
import { PhoneVerificationStep } from '@/widgets/PhoneVerificationStep'
import { Loader } from '@/shared/ui-kit'
import { AuthShell } from '@/widgets/AuthShell'

const stepComponents = {
	phone: EnterPhoneNumberStep,
	code: PhoneVerificationStep,
	newPassword: EnterNewPasswordStep,
}

export default function ResetPasswordPage() {
	const { locale } = useParams()
	const { getCurrentStep, isInitialized, initResetPasswordFlow } = useStepMarcher()
	const step = getCurrentStep()

	useEffect(() => {
		if (!isInitialized) {
			initResetPasswordFlow()
		}
	}, [isInitialized])

	useEffect(() => {
		if (step === 'success') {
			setTimeout(() => {
				redirect(`/${locale}/login`)
			}, 1500)
		}
	}, [step, locale])

	if (!isInitialized) return <Loader />

	const StepComponent = step ? stepComponents[step] : null

	if (step === 'phone') {
		return (
			<AuthShell
				title="Введите номер телефона"
				showNavigation={true}
				navigationText=""
				navigationLinkText="Войти"
				navigationLinkHref="/auth/login"
			>
				<StepComponent
					warning={false}
					variant={'reset-password'}
				/>
			</AuthShell>
		)
	}
	if (step === 'code') {
		return (
			<AuthShell
				title="Введите код подтверждения"
				showNavigation={true}
				navigationText=""
				navigationLinkText="Войти"
				navigationLinkHref="/auth/login"
			>
				<StepComponent variant={'reset-password'} />
			</AuthShell>
		)
	}

	return StepComponent ? (
		<AuthShell
			title="Новый пароль"
			showNavigation={true}
			navigationText=""
			navigationLinkText="Войти"
			navigationLinkHref="/auth/login"
		>
			<StepComponent />
		</AuthShell>
	) : null
}
