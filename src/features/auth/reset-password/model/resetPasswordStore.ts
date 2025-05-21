import { z } from 'zod'
import { create } from 'zustand'
import { redirect } from 'next/navigation'

import { authApi } from '@/shared/api'
import { passwordSchema } from '@/shared/lib'

import { useLoginStore } from '../../login'

interface NewPasswordState {
	password: string
	password_confirmation: string
	errors: Partial<Record<keyof z.infer<typeof passwordSchema>, string>>
	isSubmitting: boolean
	success: boolean
	setField: (field: string, value: string) => void
	submit: () => Promise<void>
	checkPhoneExist: (phone: string | null) => void
}

export const useNewPasswordStore = create<NewPasswordState>((set, get) => ({
	password: '',
	password_confirmation: '',
	errors: {},
	isSubmitting: false,
	success: false,
	setField: (field, value) => {
		set({ [field]: value })
	},

	checkPhoneExist: (phone) => {
		if (!phone) {
			redirect(`/auth/reset-password`)
		}
	},

	submit: async () => {
		const { password, password_confirmation } = get()

		const parsed = passwordSchema.safeParse({ password, password_confirmation })

		if (!parsed.success) {
			const errors: any = {}
			for (const key in parsed.error.formErrors.fieldErrors) {
				errors[key] = parsed.error.formErrors.fieldErrors[key]?.[0] ?? ''
			}
			set({ errors })
			return
		}

		set({ isSubmitting: true, errors: {}, success: false })

		try {
			await authApi.updatePassword({ password, password_confirmation })

			useLoginStore.getState().reset()

			set({ success: true })
		} catch (e) {
			console.error(e)
		} finally {
			set({ isSubmitting: false })
		}
	},
}))
