import { authService } from '@/features/auth'

const addAuthHeader = (token: string, options: RequestInit = {}) => {
	return {
		...options,
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			'Accept-Language': navigator.language,
			...options.headers,
			Authorization: `Bearer ${token}`,
		},
	}
}

export const httpClientWithAuth = async <T>(url: string, options?: RequestInit): Promise<T> => {
	let token: string

	try {
		token = authService.ensureToken()
	} catch (e) {
		console.warn('Ошибка получения токена', e)
		throw e
	}

	const headersOptions = addAuthHeader(token, options || {})

	try {
		const res = await fetch(url, headersOptions)

		if (!res.ok) {
			let errorMessage = 'Что-то пошло не так'

			try {
				const error = await res.json()
				errorMessage = error?.message || errorMessage
			} catch {}

			throw new Error(errorMessage)
		}

		return await res.json()
	} catch (error) {
		console.error('Ошибка сети или запроса:', error)
		throw error
	}
}

export const httpClient = async <T>(url: string, options?: RequestInit): Promise<T> => {
	const res = await fetch(url, {
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			'Accept-Language': navigator.language,
			...(options?.headers || {}),
		},
		...options,
	})

	if (!res.ok) {
		const error = await res.json()
		throw new Error(error.message || 'Something went wrong')
	}

	return await res.json()
}
