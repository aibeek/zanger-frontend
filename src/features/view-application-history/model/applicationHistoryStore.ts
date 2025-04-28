import { create } from 'zustand'

import { City } from '@/shared'
import { applicationApi, ApplicationHistoryItem } from '@/shared/api/applicationApi'

interface ApplicationHistoryStore {
	applicationsHistory: ApplicationHistoryItem[]
	loadingApplicationsHistory: boolean
	fetchApplicationsHistory: () => Promise<void>
}

export const useApplicationHistoryStore = create<ApplicationHistoryStore>((set) => ({
	applicationsHistory: [],
	loadingApplicationsHistory: false,

	fetchApplicationsHistory: async () => {
		set({ loadingApplicationsHistory: true })
		try {
			const applicationsHistory = (await applicationApi.historyApplications()) as any

			set({ applicationsHistory: applicationsHistory.data })
		} catch (error) {
			console.error('Ошибка при загрузке городов:', error)
		} finally {
			set({ loadingApplicationsHistory: false })
		}
	},
}))
