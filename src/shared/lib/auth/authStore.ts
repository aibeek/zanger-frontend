import { create } from 'zustand'

import { authService } from '@/features/auth'

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
		const result = await authService.check()
		set({ isAuthenticated: result.isAuthenticated, authChecked: true })
	},

	logout: () => {
		authService.logout()
		set({ isAuthenticated: false, authChecked: true })
	},
}))
