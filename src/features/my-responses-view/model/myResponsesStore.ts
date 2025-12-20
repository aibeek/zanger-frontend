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
	archivedIds: number[]
	deletedIds: number[]

	closeItem: (id: number) => void
	workOut: (id: number) => Promise<void>
	archiveResponse: (id: number) => Promise<void>
	deleteResponse: (id: number) => Promise<void>
}

export const useMyResponsesStore = create<MyResponsesStore>((set, get) => ({
	workedOutIds: [],
	archivedIds: [],
	deletedIds: [],

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

	archiveResponse: async (id: number) => {
		try {
			await lawyerApi.archiveResponse(id)
			toast.success('Заявка перемещена в архив')

			const prev = get().archivedIds
			if (!prev.includes(id)) {
				set({ archivedIds: [...prev, id] })
			}

			await mutate('/lawyers/responses')
			await mutate('/lawyers/responses/archived')
		} catch (e) {
			console.error('Ошибка при архивации', e)
			toast.error('Не удалось переместить в архив')
		}
	},

	deleteResponse: async (id: number) => {
		try {
			await lawyerApi.deleteResponse(id)
			toast.success('Заявка удалена')

			const prev = get().deletedIds
			if (!prev.includes(id)) {
				set({ deletedIds: [...prev, id] })
			}

			await mutate('/lawyers/responses')
			await mutate('/lawyers/responses/archived')
		} catch (e) {
			console.error('Ошибка при удалении', e)
			toast.error('Не удалось удалить заявку')
		}
	},

	closeItem: (id: number) =>
		set((state) => ({
			workedOutIds: [...state.workedOutIds, id],
		})),
}))
