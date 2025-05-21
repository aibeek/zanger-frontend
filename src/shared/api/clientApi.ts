import { API_URL } from '../config'
import { httpClientWithAuth } from './httpClient'
import { createQuery } from '../lib/helpers/query'

export interface CreateApplicationType {
	description: string
	region_id: number
	tag_id?: number
}

export interface CancelApplicationType {
	cancel_reason: string
	application_id: number
}

export const clientApi = {
	createApplication: (data: CreateApplicationType) =>
		httpClientWithAuth(`${API_URL}/clients/orders`, {
			method: 'POST',
			body: JSON.stringify(data),
		}),

	cancelApplication: (data: CancelApplicationType) =>
		httpClientWithAuth(`${API_URL}/clients/orders/${data.application_id}/cancel`, {
			method: 'PUT',
			body: JSON.stringify(data),
		}),

	historyApplications: (params: { page?: number; per_page?: number } = {}) => {
		const query = createQuery(params)
		const url = `${API_URL}/clients/orders/history${query}`

		return httpClientWithAuth(url, {
			method: 'GET',
		})
	},

	getApplications: (params: { page?: number; per_page?: number } = {}) => {
		const query = createQuery(params)
		const url = `${API_URL}/clients/orders/my${query}`

		return httpClientWithAuth(url, {
			method: 'GET',
		})
	},

	acceptResponse: ({ id }: { id: number }) =>
		httpClientWithAuth(`${API_URL}/clients/orders/responses/${id}/accept`, {
			method: 'POST',
		}),

	rejectResponse: ({ id }: { id: number }) =>
		httpClientWithAuth(`${API_URL}/clients/orders/responses/${id}/reject`, {
			method: 'POST',
		}),

	detailedResponse: ({ id }: { id: number }) =>
		httpClientWithAuth(`${API_URL}/clients/orders/responses/${id}`, {
			method: 'GET',
		}),
}
