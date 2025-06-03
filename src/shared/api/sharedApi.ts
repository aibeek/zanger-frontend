import { API_URL } from '../config'
import { httpClient, httpClientWithAuth } from './httpClient'

export interface CityType {
	id: number
	name: 'Город' | 'Область' | 'Регион' | 'Село'
}

export interface Application {
	id: number
	created_at: string
	description: string
	status: string
	responses_count: number
	responses: any[]
	tag: {
		id: number
		name: string
	}
}

export interface City {
	id: number
	name: string
	type: CityType
	path: string | null
}

export interface Tag {
	id: number
	name: string
	code: string
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

	getNotifications: () =>
		httpClientWithAuth(`${API_URL}/notifications?get-all=true`, {
			method: 'GET',
		}),

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
