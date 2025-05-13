import { create } from 'zustand'

import { Role } from '../consts'

export type StepKey = 'phone' | 'code' | 'clientRegistrationForm' | 'lawyerRegistrationForm' | 'newPassword' | 'success'

type Mode = 'register' | 'resetPassword'

const registerStepsConfig: Record<Role, StepKey[]> = {
	client: ['phone', 'code', 'clientRegistrationForm'],
	lawyer: ['phone', 'code', 'lawyerRegistrationForm'],
}

const resetPasswordStepsConfig: StepKey[] = ['phone', 'code', 'newPassword', 'success']

interface StepMarcherStore {
	role: Role | null
	mode: Mode | null
	currentStepIndex: number
	isInitialized: boolean

	setRole: (role: Role) => void
	initResetPasswordFlow: () => void
	forceSetRole: (role: Role) => void
	nextStep: () => void
	prevStep: () => void
	getCurrentStep: () => StepKey | null
	reset: () => void
}

export const useStepMarcher = create<StepMarcherStore>((set, get) => ({
	role: null,
	mode: null,
	isInitialized: false,
	currentStepIndex: 0,

	setRole: (role: Role) => set({ role, mode: 'register', currentStepIndex: 0, isInitialized: true }),

	// 👇 Новый метод — сбрасывает и устанавливает роль
	forceSetRole: (role: Role) => {
		set({
			role,
			mode: 'register',
			currentStepIndex: 0,
			isInitialized: true,
		})
	},

	initResetPasswordFlow: () => set({ role: null, mode: 'resetPassword', currentStepIndex: 0, isInitialized: true }),

	nextStep: () => {
		const { role, mode, currentStepIndex } = get()
		const steps = mode === 'register' ? registerStepsConfig[role as Role] : resetPasswordStepsConfig
		if (currentStepIndex < steps.length - 1) {
			set({ currentStepIndex: currentStepIndex + 1 })
		}
	},

	prevStep: () => {
		const { currentStepIndex } = get()
		if (currentStepIndex > 0) {
			set({ currentStepIndex: currentStepIndex - 1 })
		}
	},

	getCurrentStep: () => {
		const { role, mode, currentStepIndex } = get()
		if (!mode) return null
		const steps = mode === 'register' ? registerStepsConfig[role as Role] : resetPasswordStepsConfig
		return steps[currentStepIndex] ?? null
	},

	reset: () => set({ role: null, mode: null, currentStepIndex: 0, isInitialized: false }),
}))
