import { useLoginStore } from '@/features/auth'
import { authApi, profileApi, UpdateClientData } from '@/shared/api'
import { UserProfile } from '@/shared/lib/types'
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

			const updatedPersonalData = (await authApi.me()) as UserProfile

			useLoginStore.setState({ personalData: updatedPersonalData })
			localStorage.setItem('personalData', JSON.stringify(updatedPersonalData))

			set({ success: true })

			toast.success('Данные успешно обновлены')
		} catch (e: any) {
			console.error(e)
			toast.error('Произошла ошибка')
		} finally {
			set({ isSubmitting: false })
		}
	},
}))
