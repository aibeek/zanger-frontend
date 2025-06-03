import toast from 'react-hot-toast'
import { create } from 'zustand'

import { profileApi, UpdateConsultationPrice } from '@/shared/api'
import { refreshUser } from '@/shared/lib/helpers/refreshUser'

interface ConsultationPriceState {
	isSubmitting: boolean
	success: boolean
	updateConsultationPrice: (data: UpdateConsultationPrice) => Promise<void>
}

export const useConsultationPriceStore = create<ConsultationPriceState>((set) => ({
	isSubmitting: false,
	success: false,

	updateConsultationPrice: async (price) => {
		set({ isSubmitting: true, success: false })

		try {
			await profileApi.updateConsultationPrice(price)

			set({ success: true })

			await refreshUser()

			toast.success('Цена успешно обновлена')
		} catch (e: any) {
			console.error(e)
			toast.error('Произошла ошибка')
		} finally {
			set({ isSubmitting: false })
		}
	},
}))
