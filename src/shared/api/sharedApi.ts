import { API_URL } from '../config'
import { httpClient, httpClientWithAuth } from './httpClient'

export interface CityType {
	id: number
	name: 'Город' | 'Область'
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
	getCities: () =>
		httpClient(`${API_URL}/regions/cities`, {
			method: 'GET',
		}),

	regionsPaginated: (page = 1) =>
		httpClient(`${API_URL}/regions/paginated?page=${page}`, {
			method: 'GET',
		}),

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

	updateNotifications: ({ generalNotifications, lawyerReplies, appUpdates }) => console.log('updateNotifications'),

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
