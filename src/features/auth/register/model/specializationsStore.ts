import { create } from 'zustand'

import { sharedApi, Tag } from '@/shared/api'

interface SpecializationsStore {
	specializations: Tag[]
	loadingSpecializations: boolean
	fetchSpecializations: () => Promise<void>
}

export const useSpecializationsStore = create<SpecializationsStore>((set) => ({
	specializations: [],
	loadingSpecializations: false,

	fetchSpecializations: async () => {
		set({ loadingSpecializations: true })
		try {
			const specializations = (await sharedApi.getAllSpecializations()) as any

			set({ specializations: specializations.data })
		} catch (error) {
			console.error('Ошибка при загрузке cпециализаций:', error)
		} finally {
			set({ loadingSpecializations: false })
		}
	},
}))
