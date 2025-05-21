import { create } from 'zustand'

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
			set({ success: true, loading: false })
		} catch (error: any) {
			const errorMessage = error?.errors?.phone?.[0] || error?.message
			set({ error: errorMessage, disableAfterError: true, loading: false })
		}
	},

	resetState: () => set({ error: null, disableAfterError: false }),
}))
