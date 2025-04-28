import { create } from 'zustand'
import { z } from 'zod'
import { passwordSchema } from '@/shared'
import { authApi } from '@/shared/api'
import { redirect } from 'next/navigation'

interface NewPasswordState {
	password: string
	password_confirmation: string
	errors: Partial<Record<keyof z.infer<typeof passwordSchema>, string>>
	isSubmitting: boolean
	success: boolean
	setField: (field: string, value: string) => void
	submit: () => Promise<void>
	checkPhoneExist: (phone: string | null, locale: string) => void
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

	checkPhoneExist: (phone, locale) => {
		if (!phone) {
			redirect(`/${locale}/auth/reset-password`)
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
			const res = (await authApi.updatePassword({ password, password_confirmation })) as { message: string }

			if (res.message === 'messages.password_success_reset') {
				set({ success: true })
			} else {
			}
		} catch (e) {
			console.error(e)
		} finally {
			set({ isSubmitting: false })
		}
	},
}))
