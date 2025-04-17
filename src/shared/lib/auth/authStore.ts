import Cookies from 'js-cookie'
import { create } from 'zustand'

import { tokenService } from '@/shared/api'

interface AuthState {
	isAuthenticated: boolean
	authChecked: boolean
	checkAuth: () => void
	logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
	isAuthenticated: false,
	authChecked: false,
	checkAuth: async () => {
		const valid = tokenService.isTokenValid()

		if (!valid) {
			tokenService.logout()
			Cookies.remove('role')
			set({ isAuthenticated: false, authChecked: true })

			return
		}

		const role = await tokenService.getRole()
		Cookies.set('role', role)
		set({ isAuthenticated: valid, authChecked: true })
	},

	logout: () => {
		tokenService.logout()
		set({ isAuthenticated: false, authChecked: true })
	},
}))
