'use client'

import { useEffect } from 'react'
import { redirect, useParams } from 'next/navigation'

import { RegistrationFormStep } from '@/features/auth/register'
import { EnterPhoneNumberStep } from '@/widgets/EnterPhoneNumberStep'
import { PhoneVerificationStep } from '@/widgets/PhoneVerificationStep'
import { arrRoles, Role, useStepMarcher } from '@/shared/lib'
import { Loader } from '@/shared/ui-kit'

const stepComponents = {
	phone: EnterPhoneNumberStep,
	code: PhoneVerificationStep,
	clientRegistrationForm: RegistrationFormStep,
	lawyerRegistrationForm: RegistrationFormStep,
}

export default function RegisterPage() {
	const { role } = useParams()

	const { getCurrentStep, isInitialized, forceSetRole, role: currentRoleFromStore } = useStepMarcher()
	const step = getCurrentStep()

	useEffect(() => {
		if (!arrRoles.includes(role as Role)) {
			redirect(`/`)
		}

		if (!isInitialized || role !== currentRoleFromStore) {
			forceSetRole(role as Role)
		}
	}, [role, isInitialized])

	useEffect(() => {
		if (!step && isInitialized) {
			redirect(`/auth/login`)
		}
	}, [step, isInitialized])

	if (!isInitialized) return <Loader />

	const StepComponent = step ? stepComponents[step] : null

	if (step === 'clientRegistrationForm') {
		return <StepComponent variant={'client'} />
	}
	if (step === 'lawyerRegistrationForm') {
		return <StepComponent variant={'lawyer'} />
	}

	return StepComponent ? <StepComponent /> : null
}
