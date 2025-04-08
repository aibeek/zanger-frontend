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
	checkAuth: () => {
		const valid = tokenService.isTokenValid()

		if (!valid) {
			tokenService.logout()
		}

		set({ isAuthenticated: valid, authChecked: true })
	},

	logout: () => {
		tokenService.logout()
		set({ isAuthenticated: false, authChecked: true })
	},
}))
