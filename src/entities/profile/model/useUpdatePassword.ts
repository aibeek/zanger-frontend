import { z } from 'zod'
import { create } from 'zustand'
import toast from 'react-hot-toast'

import { profileApi } from '@/shared/api'
import { updateProfilePasswordSchema } from '@/shared/lib'

interface UpdatePasswordState {
	old_password: string
	password: string
	password_confirmation: string
	errors: Partial<Record<keyof z.infer<typeof updateProfilePasswordSchema>, string>>
	isSubmitting: boolean
	success: boolean
	setField: (field: string, value: string) => void
	submit: () => Promise<void>
	reset: () => void
}

export const useUpdatePasswordStore = create<UpdatePasswordState>((set, get) => ({
	old_password: '',
	password: '',
	password_confirmation: '',
	errors: {},
	isSubmitting: false,
	success: false,
	setField: (field, value) => {
		set({ [field]: value })
	},
	reset: () =>
		set({
			old_password: '',
			password: '',
			password_confirmation: '',
			errors: {},
			success: false,
			isSubmitting: false,
		}),

	submit: async () => {
		const { old_password, password, password_confirmation } = get()

		const parsed = updateProfilePasswordSchema.safeParse({ old_password, password, password_confirmation })

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
			const res = (await profileApi.updatePassword({ old_password, password, password_confirmation })) as {
				message: string
			}

			if (res.message === 'Ваш пароль успешно обновлен!') {
				set({ success: true })
				toast.success(res.message, { duration: 3000, position: 'top-right' })
			}
		} catch (e: any) {
			console.error(e)

			const message = e?.response?.message || e?.message || 'Произошла неизвестная ошибка'

			if (message === 'Неверный пароль') {
				toast.error('Неверный текущий пароль', { duration: 3000, position: 'top-right' })
			} else {
				toast.error(message, { duration: 3000, position: 'top-right' })
			}
		} finally {
			set({ isSubmitting: false })
		}
	},
}))
