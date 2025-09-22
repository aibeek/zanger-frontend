'use client'

import { useEffect } from 'react'
import { redirect, useParams } from 'next/navigation'

import { useStepMarcher } from '@/shared/lib'
import { EnterNewPasswordStep } from '@/features/auth'
import { EnterPhoneNumberStep } from '@/widgets/EnterPhoneNumberStep'
import { PhoneVerificationStep } from '@/widgets/PhoneVerificationStep'
import { Loader } from '@/shared/ui-kit'
import { AuthShell } from '@/widgets/AuthShell'
import Image from 'next/image'
import { Link } from '@/i18n'

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

	const header = (
		<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
			<div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
				<Image src="/logo.svg" alt="Zanger" width={28} height={28} />
				<span style={{ fontWeight: 700, color: '#1f2937', letterSpacing: '.5px' }}>ZANGER</span>
			</div>
			<div>
				<Link href="/auth/login" style={{ color: '#2563eb', fontWeight: 600 }}>Войти</Link>
			</div>
		</div>
	)

	if (step === 'phone') {
		return (
			<AuthShell rightHeader={header}>
				<StepComponent
					warning={false}
					variant={'reset-password'}
				/>
			</AuthShell>
		)
	}
	if (step === 'code') {
		return (
			<AuthShell rightHeader={header}>
				<StepComponent variant={'reset-password'} />
			</AuthShell>
		)
	}

	return StepComponent ? (
		<AuthShell rightHeader={header}>
			<StepComponent />
		</AuthShell>
	) : null
}
