import { httpClient } from './httpClient'
import { baseApiURI } from '../lib/consts'

export interface CityType {
	id: number
	name: 'Город' | 'Область'
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

export const sharedApi = {
	getAllCities: () =>
		httpClient(`${baseApiURI}/regions/all`, {
			method: 'GET',
		}),

	getAllSpecializations: () =>
		httpClient(`${baseApiURI}/lawyer-types`, {
			method: 'GET',
		}),
}
