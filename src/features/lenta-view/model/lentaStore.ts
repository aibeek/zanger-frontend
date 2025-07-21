import { create } from 'zustand'
import toast from 'react-hot-toast'

import { lawyerApi } from '@/shared/api'

interface LentaStore {
	respondedIds: number[]
	addRespondedId: (id: number) => void
	removeRespondedId: (id: number) => void
	applyToRequest: (
		{
			order_id,
			mutate,
		}: {
			order_id: number
			mutate: any
		},
		t,
	) => Promise<void>
}
export const useLentaStore = create<LentaStore>((set, get) => ({
	respondedIds: [],
	addRespondedId: (id) =>
		set((state) => ({
			respondedIds: [...state.respondedIds, id],
		})),
	removeRespondedId: (id) =>
		set((state) => ({
			respondedIds: state.respondedIds.filter((itemId) => itemId !== id),
		})),
	applyToRequest: async ({ order_id, mutate }, t) => {
		try {
			await lawyerApi.applyToOrder({ application_id: order_id })
			get().addRespondedId(order_id)
			toast.success(t('success'))

			mutate((prevData) => {
				if (!prevData) return prevData
				const newPages = prevData.map((page) => page.filter((item) => item.id !== order_id))
				return newPages
			}, false)
		} catch (e) {
			toast.error(t('error'))
		}
	},
}))
