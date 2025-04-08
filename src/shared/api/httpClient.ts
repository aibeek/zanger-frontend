import { tokenService } from './tokenService'

const addAuthHeader = (options: RequestInit = {}) => {
	const token = tokenService.getToken()

	if (token) {
		options.headers = {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			'Accept-Language': navigator.language,
			...options.headers,
			Authorization: `Bearer ${token}`,
		}
	}

	return options
}

export const httpClientWithAuth = async <T>(url: string, options?: RequestInit): Promise<T> => {
	tokenService.refreshToken()

	const headersOptions = addAuthHeader(options || {})

	const res = await fetch(url, headersOptions)

	if (!res.ok) {
		const error = await res.json()
		throw new Error(error.message || 'Что-то пошло не так')
	}

	return res.json()
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
