import { create } from 'zustand'
import toast from 'react-hot-toast'
import { clientApi, sharedApi } from '@/shared/api'

interface NotificationsState {
	generalNotifications: boolean
	lawyerReplies: boolean
	appUpdates: boolean
	isSubmitting: boolean
	setField: (field: keyof Omit<NotificationsState, 'setField' | 'reset' | 'submit'>, value: boolean) => void
	reset: () => void
	submit: () => Promise<void>
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
	generalNotifications: false,
	lawyerReplies: false,
	appUpdates: false,
	isSubmitting: false,

	setField: (field, value) => set({ [field]: value }),

	reset: () =>
		set({
			generalNotifications: false,
			lawyerReplies: false,
			appUpdates: false,
			isSubmitting: false,
		}),

	submit: async () => {
		const { generalNotifications, lawyerReplies, appUpdates } = get()

		set({ isSubmitting: true })

		try {
			const res = await sharedApi.updateNotifications({
				generalNotifications,
				lawyerReplies,
				appUpdates,
			})

			// @ts-expect-error to fix
			if (res.message === 'Настройки уведомлений обновлены') {
				toast.success('Настройки сохранены')
			}
		} catch (e) {
			console.error(e)
			toast.error('Ошибка при сохранении')
		} finally {
			set({ isSubmitting: false })
		}
	},
}))
