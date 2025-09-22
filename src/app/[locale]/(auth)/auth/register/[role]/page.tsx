'use client'

import { useEffect } from 'react'
import { redirect, useParams } from 'next/navigation'
import Image from 'next/image'

import { RegistrationFormStep } from '@/features/auth/register'
import { EnterPhoneNumberStep } from '@/widgets/EnterPhoneNumberStep'
import { PhoneVerificationStep } from '@/widgets/PhoneVerificationStep'
import { arrRoles, RoleVariant, useStepMarcher } from '@/shared/lib'
import { Loader } from '@/shared/ui-kit'
import { AuthShell } from '@/widgets/AuthShell'
import { Link } from '@/i18n'

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

	const header = (
		<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
			<div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
				<Image src="/logo.svg" alt="Zanger" width={28} height={28} />
				<span style={{ fontWeight: 700, color: '#1f2937', letterSpacing: '.5px' }}>ZANGER</span>
			</div>
			<div>
				<span style={{ color: '#6b7280', marginRight: 8 }}>Есть аккаунт?</span>
				<Link href="/auth/login" style={{ color: '#2563eb', fontWeight: 600 }}>Вход</Link>
			</div>
		</div>
	)

	if (step === 'clientRegistrationForm') {
		return (
			<AuthShell rightHeader={header}>
				<StepComponent variant={'client'} />
			</AuthShell>
		)
	}
	if (step === 'lawyerRegistrationForm') {
		return (
			<AuthShell rightHeader={header}>
				<StepComponent variant={'lawyer'} />
			</AuthShell>
		)
	}

	return StepComponent ? (
		<AuthShell rightHeader={header}>
			<StepComponent />
		</AuthShell>
	) : null
}
