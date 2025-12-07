import { API_URL } from '../config'
import { httpClientWithAuth } from './httpClient'
import { createQuery } from '../lib/helpers/query'

export interface CreateApplicationType {
    description: string
    region_id: number
    tag_id?: number
    phone?: string
    appeal_language?: 'kz' | 'ru' | 'kz_ru'
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

	updateApplication: (id: number, data: CreateApplicationType) =>
		httpClientWithAuth(`${API_URL}/clients/orders/${id}`, {
			method: 'PUT',
			body: JSON.stringify(data),
		}),

	deleteApplication: (id: number) =>
		httpClientWithAuth(`${API_URL}/clients/orders/${id}`, {
			method: 'DELETE',
		}),

	getApplication: (id: number) =>
		httpClientWithAuth(`${API_URL}/clients/orders/${id}`, {
			method: 'GET',
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

	getApplicationResponses: (orderId: number) =>
		httpClientWithAuth(`${API_URL}/clients/orders/${orderId}/responses`, {
			method: 'GET',
		}),

	createCallback: ({ id }: { id: number }) =>
		httpClientWithAuth(`${API_URL}/clients/orders/responses/${id}/call-request`, {
			method: 'POST',
		}),

	completeApplication: (id: number, cancelReason: string) =>
		httpClientWithAuth(`${API_URL}/clients/orders/${id}/cancel`, {
			method: 'PUT',
			body: JSON.stringify({ cancel_reason: cancelReason }),
		}),

	getRegions: () =>
		httpClientWithAuth(`${API_URL}/regions/all`, {
			method: 'GET',
		}),

	getTags: () =>
		httpClientWithAuth(`${API_URL}/tags`, {
			method: 'GET',
		}),
}
