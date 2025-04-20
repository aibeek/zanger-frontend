'use client'

import { useEffect } from 'react'
import { redirect, useParams } from 'next/navigation'

import { arrRoles } from '@/shared/lib/consts'
import { Role, useStepMarcher } from '@/shared'
import { RegistrationFormStep } from '@/features/auth/register'
import { EnterPhoneNumberStep } from '@/widgets/EnterPhoneNumberStep'
import { PhoneVerificationStep } from '@/widgets/PhoneVerificationStep'

const stepComponents = {
	phone: EnterPhoneNumberStep,
	code: PhoneVerificationStep,
	clientRegistrationForm: RegistrationFormStep,
	lawyerRegistrationForm: RegistrationFormStep,
}

export default function RegisterPage() {
	const { role, locale } = useParams()
	const { getCurrentStep, isInitialized, setRole } = useStepMarcher()
	const step = getCurrentStep()

	useEffect(() => {
		if (arrRoles.includes(role as Role) && !isInitialized) {
			setRole(role as Role)
		} else if (!arrRoles.includes(role as Role)) {
			redirect(`/${locale}`)
		}
	}, [role, locale, isInitialized])

	useEffect(() => {
		if (!step && isInitialized) {
			redirect(`/login`)
		}
	}, [step, isInitialized])

	if (!isInitialized) return <div>Загрузка...</div>

	const StepComponent = step ? stepComponents[step] : null

	if (step === 'clientRegistrationForm') {
		return <StepComponent variant={'client'} />
	}
	if (step === 'lawyerRegistrationForm') {
		return <StepComponent variant={'lawyer'} />
	}

	return StepComponent ? <StepComponent /> : null
}
