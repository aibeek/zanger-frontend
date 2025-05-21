import toast from 'react-hot-toast'
import { create } from 'zustand'

import { profileApi, sharedApi, Tag } from '@/shared/api'

interface ChangeSpecializationState {
	isSubmitting: boolean
	success: boolean

	specializations: Tag[]
	loadingSpecializations: boolean
	updateLawyerSpecializations: (data: { specialization_ids: number[] }) => Promise<void>
	fetchSpecializations: () => Promise<void>
}

export const useChangeSpecializationStore = create<ChangeSpecializationState>((set) => ({
	isSubmitting: false,
	success: false,
	specializations: [],
	loadingSpecializations: false,

	updateLawyerSpecializations: async (data) => {
		set({ isSubmitting: true, success: false })

		try {
			// @ts-expect-error fix it
			await profileApi.updateLawyerSpecializations(data)

			set({ success: true })

			toast.success('Специализации успешно обновлены')
		} catch (e: any) {
			console.error(e)
			toast.error('Произошла ошибка')
		} finally {
			set({ isSubmitting: false })
		}
	},

	fetchSpecializations: async () => {
		set({ loadingSpecializations: true })
		try {
			const specializations = (await sharedApi.getAllSpecializations()) as any

			// const specializations = (await profileApi.getLawyerSpecializations()) as any

			set({ specializations: specializations.data })
		} catch (error) {
			console.error('Ошибка при загрузке cпециализаций:', error)
		} finally {
			set({ loadingSpecializations: false })
		}
	},
}))
