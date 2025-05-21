import Cookies from 'js-cookie'

import { parseError } from '@/shared/lib'
import { authApi, LoginDto, tokenService } from '@/shared/api'

export const authService = {
	async check() {
		if (!tokenService.isTokenValid()) {
			this.logout()
			return { isAuthenticated: false }
		}

		const role = await this.getRole()
		if (role) Cookies.set('role', role)

		return { isAuthenticated: true }
	},

	logout() {
		tokenService.clearToken()
		Cookies.remove('role')
		localStorage.removeItem('personalData')
	},

	ensureToken() {
		if (!tokenService.isTokenValid()) {
			tokenService.clearToken()
			throw new Error('Срок действия токена истёк. Требуется повторная авторизация.')
		}

		return tokenService.getToken()
	},

	async getRole(): Promise<'client' | 'lawyer' | null> {
		const token = tokenService.getToken()
		if (!token) return null

		const cachedPersonalData = localStorage.getItem('personalData')
		if (cachedPersonalData) {
			const personalData = JSON.parse(cachedPersonalData)
			return personalData.role_id.code
		}

		try {
			const personalData = await authApi.me()

			localStorage.setItem('personalData', JSON.stringify(personalData))
			// @ts-expect-error fix it
			return personalData.role_id.code as 'client' | 'lawyer'
		} catch (error) {
			console.error('Ошибка при получении роли:', error)
			return null
		}
	},

	async loginAndGetPersonalData(loginData: LoginDto) {
		try {
			const loginResponse = await authApi.login(loginData)

			tokenService.saveToken({
				// @ts-expect-error to fix
				access_token: loginResponse.access_token,
				// @ts-expect-error to fix
				expires_in: loginResponse.expires_in,
			})

			const cachedPersonalData = localStorage.getItem('personalData')
			if (cachedPersonalData) {
				return { personalData: JSON.parse(cachedPersonalData) }
			}

			const personalData = await authApi.me()
			localStorage.setItem('personalData', JSON.stringify(personalData))
			return { personalData }
		} catch (e: any) {
			throw new Error(parseError(e, 'Ошибка при логине'))
		}
	},

	async getPersonalDataByToken() {
		try {
			const cachedPersonalData = localStorage.getItem('personalData')
			if (cachedPersonalData) {
				return JSON.parse(cachedPersonalData)
			}

			const personalData = await authApi.me()
			localStorage.setItem('personalData', JSON.stringify(personalData))
			return personalData
		} catch (e: any) {
			throw new Error(parseError(e, 'Ошибка при получении личных данных'))
		}
	},
}
