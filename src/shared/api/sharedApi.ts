import { API_URL } from '../config'
import { httpClient, httpClientWithAuth } from './httpClient'
import { Tag } from '../lib/types'

export interface CityType {
	id: number
	name: 'Город' | 'Область' | 'Регион' | 'Село'
}

export interface City {
	id: number
	name: string
	type: CityType
	path: string | null
}

export interface CitiesResponse {
	data: City[]
}

export interface TagsResponse {
	data: Tag[]
}

export const sharedApi = {
	getAllRegions: () =>
		httpClient(`${API_URL}/regions/all`, {
			method: 'GET',
		}),

	getAllSpecializations: () => {
		return httpClientWithAuth(`${API_URL}/specializations`, {
			method: 'GET',
		})
	},

	getLawyerTypes: () =>
		httpClient(`${API_URL}/lawyer-types`, {
			method: 'GET',
		}),

	getAllTags: () =>
		httpClientWithAuth(`${API_URL}/tags`, {
			method: 'GET',
		}),

	getAllNotifications: (params?: { page?: number; per_page?: number }) => {
		const baseUrl = `${API_URL}/notifications`
		const query = new URLSearchParams({ 'get-all': 'true' })

		if (params?.page) query.set('page', String(params.page))
		if (params?.per_page) query.set('per_page', String(params.per_page))

		const url = `${baseUrl}?${query.toString()}`

		return httpClientWithAuth(url, {
			method: 'GET',
		})
	},

	setReadNotification: (data, id: number) =>
		httpClientWithAuth(`${API_URL}/notifications/${id}/set-read`, {
			method: 'PATCH',
			body: JSON.stringify(data),
		}),

	deleteAccount: () =>
		httpClientWithAuth(`${API_URL}/profile/delete`, {
			method: 'DELETE',
		}),

	reportUser: (id: number, role: string, content: string) =>
		httpClientWithAuth(`${API_URL}/${role === 'lawyer' ? 'lawyers/' : ''}${id}/complaint`, {
			method: 'POST',
			body: JSON.stringify({ content }),
		}),
}
