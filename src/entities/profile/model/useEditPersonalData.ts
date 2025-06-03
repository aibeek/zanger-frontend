import { profileApi, UpdateClientData } from '@/shared/api'
import { refreshUser } from '@/shared/lib/helpers/refreshUser'
import toast from 'react-hot-toast'
import { create } from 'zustand'

interface EditPersonalDataState {
	isSubmitting: boolean
	success: boolean
	updateProfilePersonalData: (data: UpdateClientData, role: string) => Promise<void>
}

export const useEditPersonalDataStore = create<EditPersonalDataState>((set) => ({
	isSubmitting: false,
	success: false,

	updateProfilePersonalData: async (data, role) => {
		set({ isSubmitting: true, success: false })

		try {
			await profileApi.updateProfilePersonalData(data, role)

			await new Promise((resolve) => setTimeout(resolve, 2000))
			set({ success: true })
			await refreshUser()

			toast.success('Данные успешно обновлены')
		} catch (e: any) {
			toast.error('Произошла ошибка')
		} finally {
			set({ isSubmitting: false })
		}
	},
}))
