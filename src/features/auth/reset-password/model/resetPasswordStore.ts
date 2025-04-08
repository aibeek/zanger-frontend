import { create } from 'zustand'

import { authApi } from '@/shared/api'

interface NewPasswordStore {
	password: string
	passwordConfirmation: string
	loading: boolean
	error: string | null
	setPassword: (val: string) => void
	setPasswordConfirmation: (val: string) => void
	saveNewPassword: (onSuccess: () => void, onSuccessCondition?: (res: any) => boolean) => Promise<void>
}

export const useNewPassword = create<NewPasswordStore>((set, get) => ({
	password: '',
	passwordConfirmation: '',
	loading: false,
	error: null,

	setPassword: (val) => set({ password: val, error: null }),
	setPasswordConfirmation: (val) => set({ passwordConfirmation: val, error: null }),

	saveNewPassword: async (
		onSuccess,
		onSuccessCondition = (res: any) => res?.message === 'messages.password_success_reset',
	) => {
		const { password, passwordConfirmation } = get()

		if (!password || !passwordConfirmation) {
			set({ error: 'Заполните все поля' })
			return
		}

		if (password !== passwordConfirmation) {
			set({ error: 'Пароли не совпадают' })
			return
		}

		set({ loading: true, error: null })

		try {
			const res = await authApi.updatePassword({ password, password_confirmation: passwordConfirmation })

			console.log('resetPassword response:', res)

			if (onSuccessCondition(res)) {
				onSuccess()
			} else {
				set({ error: 'Не удалось сменить пароль' })
			}
		} catch (e) {
			console.error(e)
			set({ error: 'Ошибка при смене пароля' })
		} finally {
			set({ loading: false })
		}
	},
}))
