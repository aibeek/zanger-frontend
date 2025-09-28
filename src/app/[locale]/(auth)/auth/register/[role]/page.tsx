'use client'

import { useEffect } from 'react'
import { redirect, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { RegistrationFormStep } from '@/features/auth/register'
import { EnterPhoneNumberStep } from '@/widgets/EnterPhoneNumberStep'
import { PhoneVerificationStep } from '@/widgets/PhoneVerificationStep'
import { arrRoles, RoleVariant, useStepMarcher } from '@/shared/lib'
import { Loader } from '@/shared/ui-kit'
import { AuthShell } from '@/widgets/AuthShell'

const stepComponents = {
	phone: EnterPhoneNumberStep,
	code: PhoneVerificationStep,
	clientRegistrationForm: RegistrationFormStep,
	lawyerRegistrationForm: RegistrationFormStep,
}

export default function RegisterPage() {
	const { role } = useParams()
	const t = useTranslations('auth')

	const { getCurrentStep, isInitialized, forceSetRole, role: currentRoleFromStore } = useStepMarcher()
	const step = getCurrentStep()

	const getStepTitle = (currentStep: string | null) => {
		switch (currentStep) {
			case 'phone':
				return t('pages.enterPhoneTitle')
			case 'code':
				return t('pages.enterCodeTitle')
			case 'clientRegistrationForm':
				return t('pages.clientRegistrationTitle')
			case 'lawyerRegistrationForm':
				return t('pages.lawyerRegistrationTitle')
			default:
				return t('pages.registrationTitle')
		}
	}

	useEffect(() => {
		if (!arrRoles.includes(role as RoleVariant)) {
			redirect(`/`)
		}

		if (!isInitialized || role !== currentRoleFromStore) {
			forceSetRole(role as RoleVariant)
		}
	}, [role, isInitialized])

	useEffect(() => {
		if (!step && isInitialized) {
			redirect(`/auth/login`)
		}
	}, [step, isInitialized])

	if (!isInitialized) return <Loader />

	const StepComponent = step ? stepComponents[step] : null

	return (
		<AuthShell
			title={getStepTitle(step)}
			showNavigation={true}
			navigationText={t('shell.haveAccount')}
			navigationLinkText={t('shell.loginLink')}
			navigationLinkHref="/auth/login"
		>
			{StepComponent ? <StepComponent variant={role as RoleVariant} /> : <div>{t('pages.stepNotFound')}</div>}
		</AuthShell>
	)
}
