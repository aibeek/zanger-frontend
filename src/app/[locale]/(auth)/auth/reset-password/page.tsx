'use client'

import { useEffect } from 'react'
import { redirect, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

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
	const t = useTranslations('auth')
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
				title={t('pages.enterPhoneTitle')}
				showNavigation={true}
				navigationText=""
				navigationLinkText={t('shell.loginLink')}
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
				title={t('pages.enterCodeTitle')}
				showNavigation={true}
				navigationText=""
				navigationLinkText={t('shell.loginLink')}
				navigationLinkHref="/auth/login"
			>
				<StepComponent variant={'reset-password'} />
			</AuthShell>
		)
	}

	return StepComponent ? (
		<AuthShell
			title={t('pages.newPasswordTitle')}
			showNavigation={true}
			navigationText=""
			navigationLinkText={t('shell.loginLink')}
			navigationLinkHref="/auth/login"
		>
			<StepComponent />
		</AuthShell>
	) : null
}
