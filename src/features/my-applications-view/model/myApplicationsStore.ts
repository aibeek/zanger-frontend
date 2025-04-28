import { create } from 'zustand'
import toast from 'react-hot-toast'

import { Application } from '@/shared'
import { applicationApi, CancelApplicationType } from '@/shared/api/applicationApi'

interface MyApplicationsStore {
	myApplications: Application[]
	loadingMyApplications: boolean
	fetchMyApplications: () => Promise<void>
	cancelTheApplication: (data: CancelApplicationType) => void
}

export const useMyApplicationsStore = create<MyApplicationsStore>((set) => ({
	myApplications: [],
	loadingMyApplications: false,

	fetchMyApplications: async () => {
		set({ loadingMyApplications: true })
		try {
			const myApplications = (await applicationApi.getApplications()) as any

			set({ myApplications: myApplications.data })
		} catch (error) {
			console.error('Ошибка при загрузке:', error)
		} finally {
			set({ loadingMyApplications: false })
		}
	},

	cancelTheApplication: async (data) => {
		try {
			await applicationApi.cancelApplication(data)

			const updated = (await applicationApi.getApplications()) as any
			set({ myApplications: updated.data })

			toast.success('Заявка успешно отменена')
		} catch (error) {
			console.error('Ошибка при отмене заявки:', error)
			toast.error('Ошибка при отмене заявки')
		}
	},
}))
