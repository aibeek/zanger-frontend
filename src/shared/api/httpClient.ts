import { authService } from '@/features/auth'

const addAuthHeader = (token: string, options: RequestInit = {}) => {
	const isFormData = options.body instanceof FormData

	return {
		...options,
		headers: {
			Accept: 'application/json',
			'Accept-Language': typeof navigator !== 'undefined' ? navigator.language : 'ru',
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

	// Add an AbortController for a soft timeout to avoid hanging requests
	const controller = new AbortController()
	const timeoutMs = 15000
	const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

	try {
		const res = await fetch(url, { ...headersOptions, signal: controller.signal })

		if (!res.ok) {
			let errorMessage = `HTTP Error: ${res.status} ${res.statusText}`

			try {
				const errorResponse = await res.text()
				try {
					const errorJson = JSON.parse(errorResponse)
					errorMessage = (errorJson && errorJson.message) || errorMessage
				} catch {
					errorMessage = errorResponse.length > 200 ? errorResponse.substring(0, 200) + '...' : errorResponse
				}
			} catch {}

			throw new Error(errorMessage)
		}

		const contentType = res.headers.get('content-type') || ''
		if (contentType.includes('application/json')) {
			return (await res.json()) as T
		}
		const text = await res.text()
		return text as unknown as T
	} catch (error: any) {
		let reason = 'Network error'
		if (error?.name === 'AbortError') {
			reason = `Request timed out after ${timeoutMs}ms`
		}
		console.error('Ошибка сети или запроса:', reason, { url })
		throw new Error(`${reason}. Failed to fetch ${url}`)
	} finally {
		clearTimeout(timeoutId)
	}
}

export const httpClient = async <T>(url: string, options?: RequestInit): Promise<T> => {
	const controller = new AbortController()
	const timeoutMs = 15000
	const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

	try {
		const res = await fetch(url, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				'Accept-Language': typeof navigator !== 'undefined' ? navigator.language : 'ru',
				...(options?.headers || {}),
			},
			signal: controller.signal,
		})

		if (!res.ok) {
			let errorMessage = `HTTP Error: ${res.status} ${res.statusText}`

			try {
				const errorResponse = await res.text()
				console.error('Server error response:', errorResponse)

				try {
					const errorJson = JSON.parse(errorResponse)
					errorMessage = errorJson.message || errorMessage
				} catch {
					// Если не JSON, показываем первые 200 символов ответа
					errorMessage = errorResponse.length > 200 ? errorResponse.substring(0, 200) + '...' : errorResponse
				}
			} catch {}

			throw new Error(errorMessage)
		}

		const contentType = res.headers.get('content-type') || ''
		if (contentType.includes('application/json')) {
			return (await res.json()) as T
		}
		const text = await res.text()
		return text as unknown as T
	} catch (error: any) {
		let reason = 'Network error'
		if (error?.name === 'AbortError') {
			reason = `Request timed out after ${timeoutMs}ms`
		}
		console.error('Ошибка сети или запроса:', reason, { url })
		throw new Error(`${reason}. Failed to fetch ${url}`)
	} finally {
		clearTimeout(timeoutId)
	}
}
