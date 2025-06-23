import { profileApi, UpdateClientData } from '@/shared/api'
import { refreshUser } from '@/shared/lib/helpers/refreshUser'
import toast from 'react-hot-toast'
import { create } from 'zustand'

interface EditPersonalDataState {
	isSubmitting: boolean
	success: boolean
	updateProfilePersonalData: (data: UpdateClientData, role: string, t: (key: string) => string) => Promise<void>
}

export const useEditPersonalDataStore = create<EditPersonalDataState>((set) => ({
	isSubmitting: false,
	success: false,

	updateProfilePersonalData: async (data, role, t) => {
		set({ isSubmitting: true, success: false })

		try {
			await profileApi.updateProfilePersonalData(data, role)

			await new Promise((resolve) => setTimeout(resolve, 2000))
			set({ success: true })
			await refreshUser()

			toast.success(t('profile.personal_data.success'))
		} catch (e: any) {
			toast.error(t('profile.personal_data.error'))
		} finally {
			set({ isSubmitting: false })
		}
	},
}))
