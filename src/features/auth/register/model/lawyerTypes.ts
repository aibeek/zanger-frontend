import { create } from 'zustand'

import { sharedApi, Tag } from '@/shared/api'

interface LawyerTypesStore {
	lawyerTypes: Tag[]
	loadingLawyerTypes: boolean
	fetchLawyerTypes: () => Promise<void>
}

export const useLawyerTypesStore = create<LawyerTypesStore>((set) => ({
	lawyerTypes: [],
	loadingLawyerTypes: false,

	fetchLawyerTypes: async () => {
		set({ loadingLawyerTypes: true })
		try {
			const lawyerTypes = (await sharedApi.getLawyerTypes()) as any

			set({ lawyerTypes: lawyerTypes.data })
		} catch (error) {
			console.error('Ошибка при загрузке типов адвоката', error)
		} finally {
			set({ loadingLawyerTypes: false })
		}
	},
}))
