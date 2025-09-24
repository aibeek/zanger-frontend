'use client'

import { create } from 'zustand'
import toast from 'react-hot-toast'
import { mutate } from 'swr'

import { lawyerApi } from '@/shared/api'

export interface Status {
	title: string
	is_active: boolean
}

interface MyResponsesStore {
	workedOutIds: number[]

	closeItem: (id: number) => void
	workOut: (id: number) => Promise<void>
}

export const useMyResponsesStore = create<MyResponsesStore>((set, get) => ({
	workedOutIds: [],

	workOut: async (id: number) => {
		try {
			await lawyerApi.workOut(id)
			toast.success('Отклик обработан')

			const prev = get().workedOutIds
			if (!prev.includes(id)) {
				set({ workedOutIds: [...prev, id] })
			}

			await mutate('/lawyers/responses')
		} catch (e) {
			console.error('Ошибка при обработке отклика', e)
			toast.error('Не удалось обработать отклик')
		}
	},

	closeItem: (id: number) =>
		set((state) => ({
			workedOutIds: [...state.workedOutIds, id],
		})),
}))
