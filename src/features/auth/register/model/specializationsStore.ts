import { create } from 'zustand'

import { sharedApi } from '@/shared'

interface SpecializationsStore {
	specializations: any[]
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
			console.log(specializations)

			set({ specializations: specializations })
		} catch (error) {
			console.error('Ошибка при загрузке cпециализаций:', error)
		} finally {
			set({ loadingSpecializations: false })
		}
	},
}))
