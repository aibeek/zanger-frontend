import { create } from 'zustand'

import { sharedApi, CitiesResponse, City } from '@/shared'

interface CitiesStore {
	cities: City[]
	loadingCities: boolean
	fetchCities: () => Promise<void>
}

export const useCitiesStore = create<CitiesStore>((set) => ({
	cities: [],
	loadingCities: false,

	fetchCities: async () => {
		set({ loadingCities: true })
		try {
			const cities = (await sharedApi.getAllCities()) as any

			set({ cities: cities.data })
		} catch (error) {
			console.error('Ошибка при загрузке городов:', error)
		} finally {
			set({ loadingCities: false })
		}
	},
}))
