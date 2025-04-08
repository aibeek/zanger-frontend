import { create } from 'zustand'

import { errorMessages } from '@/shared'
import { authApi, PhoneAuthVariant } from '@/shared/api'

interface EnterPhoneStore {
	phone: string
	loading: boolean
	error: string | null
	success: boolean
	disableAfterError: boolean
	setPhone: (phone: string) => void
	sendPhoneNumber: (phone: string, onSuccess: () => void, variant?: PhoneAuthVariant) => Promise<void>
	resetState: () => void
}

export const useEnterPhone = create<EnterPhoneStore>((set) => ({
	phone: '',
	loading: false,
	error: null,
	success: false,
	disableAfterError: false,
	setPhone: (phone: string) => set({ phone }),

	sendPhoneNumber: async (phone, onSuccess, variant) => {
		set({ phone, loading: true, error: null, success: false, disableAfterError: false })

		try {
			await authApi.sendPhone({ phone }, variant)
			onSuccess()
			set({ success: true })
		} catch (error: any) {
			const errorMessage = error?.errors?.phone?.[0] || error?.message
			const localizedMessage = errorMessages[errorMessage] || 'Произошла ошибка при отправке номера'

			set({ error: localizedMessage, disableAfterError: true })
		} finally {
			set({ loading: false })
		}
	},

	resetState: () => set({ error: null, disableAfterError: false }),
}))
