'use client'

import { create } from 'zustand'
import toast from 'react-hot-toast'
import { clientApi, CancelApplicationType, Application } from '@/shared/api'

export interface DetailedLawyerResponse {
	id: number
	name: string
	icon: string | null
	type: string
	region: string
	consultation_price: number | null
	specialization: string
	phone?: string
	contacts?: {
		phone?: string | null
		telegram?: string | null
		whatsapp?: string | null
	}
}

interface MyApplicationsStore {
	detailedResponse: DetailedLawyerResponse | null
	isCancellingApplication: boolean
	filteredApplications: Application[]
	setCancellingApplication: (value: boolean) => void
	setFilteredApplications: (applications: Application[]) => void
	cancelTheApplication: (data: CancelApplicationType, mutate: () => Promise<void>) => Promise<void>
	acceptResponse: (responseId: number, mutate: () => Promise<void>) => Promise<void>
	rejectResponse: (responseId: number, mutate: () => Promise<void>) => Promise<void>
	getDetailedResponse: (responseId: number) => Promise<void>
	loadingDetailed: boolean
	createCallback: (id: number) => Promise<void>
}

export const useMyApplicationsStore = create<MyApplicationsStore>((set) => ({
	detailedResponse: null,
	isCancellingApplication: false,
	filteredApplications: [],
	loadingDetailed: false,
	setCancellingApplication: (value) => set({ isCancellingApplication: value }),
	setFilteredApplications: (applications) => set({ filteredApplications: applications }),

	cancelTheApplication: async (data, mutate) => {
		set({ isCancellingApplication: true })
		try {
			await clientApi.cancelApplication(data)
			toast.success('Заявка успешно отменена')
			await mutate()
		} catch (error) {
			toast.error('Ошибка при отмене заявки')
		} finally {
			set({ isCancellingApplication: false })
		}
	},

	acceptResponse: async (responseId, mutate) => {
		try {
			await clientApi.acceptResponse({ id: responseId })
			toast.success('Отклик успешно принят')
			await mutate()
		} catch (error) {
			toast.error('Ошибка при принятии отклика')
		}
	},

	rejectResponse: async (responseId, mutate) => {
		try {
			await clientApi.rejectResponse({ id: responseId })
			toast.success('Отклик отклонён')
			await mutate()
		} catch (error) {
			toast.error('Ошибка при отклонении отклика')
		}
	},

	getDetailedResponse: async (responseId: number) => {
		set({ loadingDetailed: true })
		try {
			const response = (await clientApi.detailedResponse({ id: responseId })) as DetailedLawyerResponse
			set({ detailedResponse: response })
		} catch (error) {
			toast.error('Ошибка при получении деталей отклика')
		} finally {
			set({ loadingDetailed: false })
		}
	},


	createCallback: async (id: number) => {
		try {
			await clientApi.createCallback({ id: id })
			toast.success('Вызов успешно отправлен')
		} catch (error) {
			toast.error('Ошибка при отправке вызова')
		}
	},
}))
