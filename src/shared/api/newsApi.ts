import { API_URL } from '../config'
import { httpClient } from './httpClient'

export interface NewsItem {
	id: number
	title: string
	slug: string
	locale: string
	excerpt: string | null
	content: string | null
	image: string | null
	image_url: string | null
	is_published: boolean
	published_at: string | null
	created_at: string
	updated_at: string
}

export interface NewsListResponse {
	success: boolean
	data: NewsItem[]
	meta: {
		current_page: number
		last_page: number
		per_page: number
		total: number
	}
}

export interface NewsSingleResponse {
	success: boolean
	data: NewsItem
}

export interface NewsLatestResponse {
	success: boolean
	data: NewsItem[]
}

export const newsApi = {
	/**
	 * Получить список новостей с пагинацией
	 */
	getList: (params?: { locale?: string; page?: number; per_page?: number }): Promise<NewsListResponse> => {
		const query = new URLSearchParams()
		if (params?.locale) query.append('locale', params.locale)
		if (params?.page) query.append('page', params.page.toString())
		if (params?.per_page) query.append('per_page', params.per_page.toString())

		const queryString = query.toString()
		const url = `${API_URL}/news${queryString ? `?${queryString}` : ''}`

		return httpClient<NewsListResponse>(url, { method: 'GET' })
	},

	/**
	 * Получить последние новости для главной страницы
	 */
	getLatest: async (params?: { locale?: string; limit?: number }): Promise<NewsLatestResponse> => {
		const query = new URLSearchParams()
		if (params?.locale) query.append('locale', params.locale)
		if (params?.limit) query.append('limit', params.limit.toString())

		const queryString = query.toString()
		const url = `${API_URL}/news/latest${queryString ? `?${queryString}` : ''}`

		// Таймаут 3 секунды чтобы быстро показать fallback если API недоступен
		const controller = new AbortController()
		const timeoutId = setTimeout(() => controller.abort(), 3000)

		try {
			const response = await httpClient<NewsLatestResponse>(url, { 
				method: 'GET',
				signal: controller.signal 
			})
			clearTimeout(timeoutId)
			return response
		} catch (error) {
			clearTimeout(timeoutId)
			throw error
		}
	},

	/**
	 * Получить новость по slug
	 */
	getBySlug: (slug: string): Promise<NewsSingleResponse> => {
		return httpClient<NewsSingleResponse>(`${API_URL}/news/${slug}`, { method: 'GET' })
	},
}
