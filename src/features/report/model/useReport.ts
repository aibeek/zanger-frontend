import { create } from 'zustand'
import toast from 'react-hot-toast'
import { sharedApi } from '@/shared/api'

interface ReportState {
	reportedIds: number[]
	report: (id: number, role: 'client' | 'lawyer', content: string) => void
}

export const useReport = create<ReportState>((set, get) => ({
	reportedIds: [],
	report: async (id, role, content) => {
		if (get().reportedIds.includes(id)) {
			toast('Вы уже пожаловались на этого пользователя')
			return
		}

		try {
			await sharedApi.reportUser(id, role, content)
			set((state) => ({ reportedIds: [...state.reportedIds, id] }))
			toast.success('Жалоба отправлена')
		} catch (e) {
			toast.error('Ошибка при отправке жалобы')
		}
	},
}))
