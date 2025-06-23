import toast from 'react-hot-toast'
import { create } from 'zustand'

import { profileApi, UpdateConsultationPrice } from '@/shared/api'
import { refreshUser } from '@/shared/lib/helpers/refreshUser'

interface ConsultationPriceState {
	isSubmitting: boolean
	success: boolean
	updateConsultationPrice: (data: UpdateConsultationPrice, t: (key: string) => string) => Promise<void>
}

export const useConsultationPriceStore = create<ConsultationPriceState>((set) => ({
	isSubmitting: false,
	success: false,

	updateConsultationPrice: async (price, t) => {
		set({ isSubmitting: true, success: false })

		try {
			await profileApi.updateConsultationPrice(price)

			set({ success: true })
			await refreshUser()

			toast.success(t('success'))
		} catch (e: any) {
			console.error(e)
			toast.error(t('error'))
		} finally {
			set({ isSubmitting: false })
		}
	},
}))
