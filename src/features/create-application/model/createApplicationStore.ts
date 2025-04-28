import { create } from 'zustand'
import toast from 'react-hot-toast'

import { applicationApi, CreateApplicationType } from '@/shared/api/applicationApi'

interface CreateApplicationState {
	isLoading: boolean
	success: boolean
	resetTrigger: boolean
	submit: (data: CreateApplicationType) => Promise<void>
	setSuccess: (val: boolean) => void
}

export const useCreateApplicationStore = create<CreateApplicationState>((set) => ({
	isLoading: false,
	success: false,
	resetTrigger: false,

	setSuccess: (val) => set({ success: val }),

	submit: async (data) => {
		try {
			set({ isLoading: true, success: false })

			await applicationApi.createApplication(data)

			toast.success('Ваша заявка отправлено модератору на проверку', {
				position: 'top-right',
			})

			set({
				isLoading: false,
				success: true,
				resetTrigger: true,
			})

			setTimeout(() => set({ resetTrigger: false }), 100)
		} catch (error) {
			toast.error('Произошла ошибка при отправке заявки', {
				position: 'top-right',
			})
			set({ isLoading: false })
		}
	},
}))
