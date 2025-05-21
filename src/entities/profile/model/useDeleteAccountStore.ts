import { create } from 'zustand'
import toast from 'react-hot-toast'
import { sharedApi } from '@/shared/api'

interface DeleteAccountState {
	isSubmitting: boolean
	submit: () => Promise<boolean>
}

export const useDeleteAccountStore = create<DeleteAccountState>((set) => ({
	isSubmitting: false,

	submit: async () => {
		set({ isSubmitting: true })

		try {
			const res = await sharedApi.deleteAccount()

			// @ts-expect-error to fix
			if (res.message === 'Аккаунт успешно удален.') {
				return true
			} else {
				toast.error('Не удалось удалить аккаунт')
				return false
			}
		} catch (e) {
			console.error(e)
			toast.error('Не удалось удалить аккаунт')
			return false
		} finally {
			set({ isSubmitting: false })
		}
	},
}))
