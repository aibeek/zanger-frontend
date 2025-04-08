'use client'

import { useEffect } from 'react'
import { redirect, useParams } from 'next/navigation'

import { useStepMarcher } from '@/shared'
import { EnterPhoneNumberStep } from '@/features/auth/register'
import { PhoneVerificationStep } from '@/features/PhoneVerificationStep'
import { EnterNewPasswordStep } from '@/features/auth/reset-password/ui'

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

	if (!isInitialized) return <div>Загрузка...</div>

	const StepComponent = step ? stepComponents[step] : null

	if (step === 'phone') {
		return (
			<StepComponent
				warning={false}
				variant={'reset-password'}
			/>
		)
	}
	if (step === 'code') {
		return <StepComponent variant={'reset-password'} />
	}

	return StepComponent ? <StepComponent /> : null
}
