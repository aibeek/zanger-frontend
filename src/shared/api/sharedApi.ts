import { httpClient, httpClientWithAuth } from './httpClient'
import { baseApiURI } from '../lib/consts'

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
}

export interface CitiesResponse {
	data: City[]
}

export interface TagsResponse {
	data: Tag[]
}

export const sharedApi = {
	getAllCities: () =>
		httpClient(`${baseApiURI}/regions/all`, {
			method: 'GET',
		}),

	getAllSpecializations: () =>
		httpClient(`${baseApiURI}/lawyer-types`, {
			method: 'GET',
		}),

	getAllTags: () =>
		httpClientWithAuth(`${baseApiURI}/tags`, {
			method: 'GET',
		}),
}
