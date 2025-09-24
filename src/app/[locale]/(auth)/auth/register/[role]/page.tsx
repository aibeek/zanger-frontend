'use client'

import { useEffect } from 'react'
import { redirect, useParams } from 'next/navigation'

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

const stepTitles = {
	phone: 'Введите номер телефона',
	code: 'Введите код подтверждения',
	clientRegistrationForm: 'Регистрация клиента',
	lawyerRegistrationForm: 'Регистрация юриста',
}

export default function RegisterPage() {
	const { role } = useParams()

	const { getCurrentStep, isInitialized, forceSetRole, role: currentRoleFromStore } = useStepMarcher()
	const step = getCurrentStep()

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
			title={step ? stepTitles[step] : 'Регистрация'}
			showNavigation={true}
			navigationText="Есть аккаунт?"
			navigationLinkText="Вход"
			navigationLinkHref="/auth/login"
			showDisclaimer={step === 'clientRegistrationForm' || step === 'lawyerRegistrationForm'}
		>
			{StepComponent ? <StepComponent variant={role as RoleVariant} /> : <div>Шаг не найден</div>}
		</AuthShell>
	)
}
