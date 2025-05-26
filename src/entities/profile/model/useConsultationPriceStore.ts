import toast from 'react-hot-toast'
import { create } from 'zustand'

import { authApi, profileApi, UpdateConsultationPrice } from '@/shared/api'
import { useLoginStore } from '@/features/auth'
import { UserProfile } from '@/shared/lib/types'
import { mutate } from 'swr'

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

			const updatedPersonalData = (await authApi.me()) as UserProfile
			useLoginStore.setState({ personalData: updatedPersonalData })
			localStorage.setItem('personalData', JSON.stringify(updatedPersonalData))

			mutate('/auth/me')
			toast.success('Цена успешно обновлена')
		} catch (e: any) {
			console.error(e)
			toast.error('Произошла ошибка')
		} finally {
			set({ isSubmitting: false })
		}
	},
}))
