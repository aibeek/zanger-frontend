import { authService } from '@/features/auth'

const addAuthHeader = (token: string, options: RequestInit = {}) => {
	const isFormData = options.body instanceof FormData

	return {
		...options,
		headers: {
			Accept: 'application/json',
			'Accept-Language': navigator.language,
			...options.headers,
			Authorization: `Bearer ${token}`,
			...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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
		let errorMessage = `HTTP Error: ${res.status} ${res.statusText}`
		
		try {
			const errorResponse = await res.text()
			console.error('Server error response:', errorResponse)
			
			// Пытаемся распарсить JSON, если это возможно
			try {
				const errorJson = JSON.parse(errorResponse)
				errorMessage = errorJson.message || errorMessage
			} catch {
				// Если не JSON, показываем первые 200 символов ответа
				errorMessage = errorResponse.length > 200 
					? errorResponse.substring(0, 200) + '...' 
					: errorResponse
			}
		} catch {
			// Если не можем прочитать ответ, используем стандартное сообщение
		}

		throw new Error(errorMessage)
	}

	return await res.json()
}
