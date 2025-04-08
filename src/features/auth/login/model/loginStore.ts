import { create } from 'zustand'

import { authApi, LoginDto, parseError, tokenService } from '@/shared'

interface AuthState {
	loginResponse: any | null
	personalData: any | null
	loading: boolean
	reset: () => void
	login: (loginData: LoginDto) => Promise<void>
	getPersonalDataByToken: () => Promise<void>
}

export const useLoginStore = create<AuthState>((set) => ({
	loginResponse: null,
	personalData: null,
	loading: false,

	reset: () =>
		set({
			loginResponse: null,
			personalData: null,
			loading: false,
		}),

	login: async (loginData) => {
		set({ loading: true })

		try {
			const loginResponse = await authApi.login(loginData)

			tokenService.saveToken({
				// @ts-expect-error to fix
				access_token: loginResponse.access_token,
				// @ts-expect-error to fix
				expires_in: loginResponse.expires_in,
			})
			set({ loginResponse })

			const personalData = await authApi.me()
			set({ personalData })
		} catch (e: any) {
			throw new Error(parseError(e, 'Ошибка при логине'))
		} finally {
			set({ loading: false })
		}
	},

	getPersonalDataByToken: async () => {
		try {
			const personalData = await authApi.me()
			set({ personalData })
		} catch (e) {
			console.error('Ошибка при получении личных данных:', e)
		}
	},
}))
