import { create } from 'zustand'
import toast from 'react-hot-toast'

import { clientApi, CreateApplicationType } from '@/shared/api'

interface CreateApplicationState {
	success: boolean
	submit: (data: CreateApplicationType, t) => Promise<void>
	setSuccess: (val: boolean) => void
	resetSuccess: () => void
}

export const useCreateApplicationStore = create<CreateApplicationState>((set) => ({
	success: false,

	setSuccess: (val) => set({ success: val }),

	resetSuccess: () => set({ success: false }),

	submit: async (data, t) => {
		try {
			await clientApi.createApplication(data)

			toast.success(t('successStore'), {
				position: 'top-right',
			})

			set({ success: true })

			setTimeout(() => set({ success: false }), 5000)
		} catch (error) {
			toast.error(t('errorStore'), {
				position: 'top-right',
			})
		}
	},
}))
