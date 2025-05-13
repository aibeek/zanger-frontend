'use client'

import { create } from 'zustand'
import useSWR, { mutate } from 'swr'
import toast from 'react-hot-toast'
import Cookies from 'js-cookie'
import { useEffect } from 'react'

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
	telegram?: string
	whats_app?: string
}

interface MyApplicationsStore {
	myApplications: Application[]
	detailedResponse: DetailedLawyerResponse | null
	loading: boolean
	loadingDetailed: boolean
	isCancellingApplication: boolean
	filteredApplications: Application[]
	setLoading: (value: boolean) => void
	setLoadingDetailed: (value: boolean) => void
	setCancellingApplication: (value: boolean) => void
	setApplications: (applications: Application[]) => void
	setFilteredApplications: (applications: Application[]) => void
	refetchApplications: () => Promise<void>
	cancelTheApplication: (data: CancelApplicationType) => Promise<void>
	acceptResponse: (responseId: number) => Promise<void>
	rejectResponse: (responseId: number) => Promise<void>
	getDetailedResponse: (responseId: number) => Promise<void>
}

export const useMyApplicationsStore = create<MyApplicationsStore>((set, get) => ({
	myApplications: [],
	detailedResponse: null,
	loading: true,
	loadingDetailed: false,
	isCancellingApplication: false,
	filteredApplications: [],
	setLoading: (value) => set({ loading: value }),
	setLoadingDetailed: (value) => set({ loadingDetailed: value }),
	setCancellingApplication: (value) => set({ isCancellingApplication: value }),
	setApplications: (applications) => set({ myApplications: applications }),
	setFilteredApplications: (applications) => set({ filteredApplications: applications }),

	refetchApplications: async () => {
		try {
			const newData = await mutate('/client/applications')
			set({
				myApplications: newData || [],
				filteredApplications: newData || [],
				loading: false,
			})
		} catch (e) {
			console.error('Ошибка при повторной загрузке заявок', e)
			set({ myApplications: [], filteredApplications: [], loading: false })
		}
	},

	cancelTheApplication: async (data) => {
		set({ isCancellingApplication: true })
		try {
			await clientApi.cancelApplication(data)
			await get().refetchApplications()
			toast.success('Заявка успешно отменена')
		} catch (error) {
			toast.error('Ошибка при отмене заявки')
		} finally {
			set({ isCancellingApplication: false })
		}
	},

	acceptResponse: async (responseId: number) => {
		try {
			await clientApi.acceptResponse({ id: responseId })

			set((state) => {
				const updatedApplications = state.myApplications.map((application) => {
					if (application.responses) {
						application.responses = application.responses.map((response) => {
							if (response.id === responseId) {
								response.is_accepted = true
							}
							return response
						})
					}
					return application
				})
				return {
					myApplications: updatedApplications,
					filteredApplications: updatedApplications,
				}
			})

			toast.success('Отклик успешно принят')
		} catch (error) {
			toast.error('Ошибка при принятии отклика')
		}
	},

	rejectResponse: async (responseId: number) => {
		try {
			await clientApi.rejectResponse({ id: responseId })
			await get().refetchApplications()
			toast.success('Отклик отклонён')
		} catch (error) {
			toast.error('Ошибка при отклонении отклика')
		}
	},

	getDetailedResponse: async (responseId: number) => {
		set({ loadingDetailed: true })
		try {
			const response = await clientApi.detailedResponse({ id: responseId })
			// @ts-expect-error fix it
			set({ detailedResponse: response })
		} catch (error) {
			toast.error('Ошибка при получении деталей отклика')
		} finally {
			set({ loadingDetailed: false })
		}
	},
}))

const fetchApplications = async () => {
	const role = Cookies.get('role')
	if (role !== 'client') return []

	try {
		const response = await clientApi.getApplications()
		// @ts-expect-error fix it
		return response.data
	} catch (error) {
		console.error('Ошибка при получении заявок:', error)
		return []
	}
}

export const useMyApplicationsSWR = () => {
	const setApplications = useMyApplicationsStore((state) => state.setApplications)
	const setFilteredApplications = useMyApplicationsStore((state) => state.setFilteredApplications)
	const setLoading = useMyApplicationsStore((state) => state.setLoading)

	const { data, error } = useSWR('/client/applications', fetchApplications, {
		revalidateOnFocus: false,
		shouldRetryOnError: false,
	})

	useEffect(() => {
		if (data) {
			setApplications(data)
			setFilteredApplications(data)
			setLoading(false)
		} else if (error) {
			setApplications([])
			setFilteredApplications([])
			setLoading(false)
		}
	}, [data, error, setApplications, setFilteredApplications, setLoading])
}
