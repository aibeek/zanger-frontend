import { create } from 'zustand'

import { LoginDto } from '@/shared/api'

import { authService } from '../service'
import { UserProfile } from '@/shared/lib/types'

interface AuthState {
	personalData: UserProfile | null
	loading: boolean
	error: string | null
	reset: () => void
	login: (loginData: LoginDto) => Promise<void>
	getPersonalDataByToken: () => Promise<void>
}

export const useLoginStore = create<AuthState>((set) => ({
	personalData: null,
	loading: false,
	error: null,

	reset: () =>
		set({
			personalData: null,
			loading: false,
			error: null,
		}),

	login: async (loginData) => {
		set({ loading: true, error: null })

		try {
			const { personalData } = await authService.loginAndGetPersonalData(loginData)
			set({ personalData })
		} catch (e: any) {
			set({ error: e.message })
			throw e
		} finally {
			set({ loading: false })
		}
	},

	getPersonalDataByToken: async () => {
		try {
			const personalData = await authService.getPersonalDataByToken()
			set({ personalData })
		} catch (e: any) {
			set({ error: e.message })
		}
	},
}))
