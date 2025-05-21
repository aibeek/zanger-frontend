export const tokenService = {
	saveToken({ access_token, expires_in }: { access_token: string; expires_in: number }) {
		localStorage.setItem('access_token', access_token)
		const expires_at = Date.now() + expires_in * 1000
		localStorage.setItem('expires_at', String(expires_at))
	},

	getToken(): string | null {
		return localStorage.getItem('access_token')
	},

	isTokenValid(): boolean {
		const token = this.getToken()
		const expiresAt = Number(localStorage.getItem('expires_at') || '0')
		return !!token && Date.now() < expiresAt
	},

	clearToken() {
		localStorage.removeItem('access_token')
		localStorage.removeItem('expires_at')
	},
}
