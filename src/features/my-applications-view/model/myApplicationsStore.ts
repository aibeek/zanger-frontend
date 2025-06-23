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
	cancelTheApplication: (
		data: CancelApplicationType,
		mutate: () => Promise<void>,
		t: (key: string) => string,
	) => Promise<void>
	acceptResponse: (responseId: number, mutate: () => Promise<void>, t: (key: string) => string) => Promise<void>
	rejectResponse: (responseId: number, mutate: () => Promise<void>, t: (key: string) => string) => Promise<void>
	getDetailedResponse: (responseId: number, t: (key: string) => string) => Promise<void>
	loadingDetailed: boolean
	createCallback: (id: number, t: (key: string) => string) => Promise<void>
}

export const useMyApplicationsStore = create<MyApplicationsStore>((set) => ({
	detailedResponse: null,
	isCancellingApplication: false,
	filteredApplications: [],
	loadingDetailed: false,

	setCancellingApplication: (value) => set({ isCancellingApplication: value }),
	setFilteredApplications: (applications) => set({ filteredApplications: applications }),

	cancelTheApplication: async (data, mutate, t) => {
		set({ isCancellingApplication: true })
		try {
			await clientApi.cancelApplication(data)
			toast.success(t('cancelSuccess'))
			await mutate()
		} catch (error) {
			toast.error(t('cancelError'))
		} finally {
			set({ isCancellingApplication: false })
		}
	},

	acceptResponse: async (responseId, mutate, t) => {
		try {
			await clientApi.acceptResponse({ id: responseId })
			toast.success(t('acceptSuccess'))
			await mutate()
		} catch (error) {
			toast.error(t('acceptError'))
		}
	},

	rejectResponse: async (responseId, mutate, t) => {
		try {
			await clientApi.rejectResponse({ id: responseId })
			toast.success(t('rejectSuccess'))
			await mutate()
		} catch (error) {
			toast.error(t('rejectError'))
		}
	},

	getDetailedResponse: async (responseId, t) => {
		set({ loadingDetailed: true })
		try {
			const response = (await clientApi.detailedResponse({ id: responseId })) as DetailedLawyerResponse
			set({ detailedResponse: response })
		} catch (error) {
			toast.error(t('detailError'))
		} finally {
			set({ loadingDetailed: false })
		}
	},

	createCallback: async (id, t) => {
		try {
			await clientApi.createCallback({ id })
			toast.success(t('callbackSuccess'))
		} catch (error) {
			toast.error(t('callbackError'))
		}
	},
}))
