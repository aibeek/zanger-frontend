import { API_URL } from '../config'
import { createQuery } from '../lib'
import { httpClientWithAuth } from './httpClient'

export interface LentaItem {
	id: string
	user: {
		id: string
		name: string
		icon: string
	}
	tag: {
		id: 0
		name: string
		specialization: {
			id: 0
			name: string
		}
	}
	description: string
	created_at: string
}

interface Specialization {
	id: number
	name: string
}

interface Tag {
	id: number
	name: string
	specialization: Specialization
}

interface Status {
	title: string
	is_active: boolean
}

interface User {
	id: number
	name: string
	icon: string | null
}

interface Order {
	id: number
	tag: Tag
	created_at: string
}

export interface MyResponse {
	id: number
	created_at: string
	description: string
	order: Order
	tag: Tag
	status: Status[]
	user: User
}

export const lawyerApi = {
	applyToOrder: (data: any) =>
		httpClientWithAuth(`${API_URL}/lawyers/orders/${data.application_id}`, {
			method: 'POST',
			body: JSON.stringify(data),
		}),

	getOrders: (params?: Record<string, string | number>) => {
		const query = createQuery(params)
		const url = `${API_URL}/lawyers/orders${query}`

		return httpClientWithAuth(url, {
			method: 'GET',
		})
	},

	getDetailedOrders: (data: any) =>
		httpClientWithAuth(`${API_URL}/lawyers/orders/${data.application_id}`, {
			method: 'GET',
		}),

	getResponses: (params?: { page?: number; per_page?: number }) => {
		const query = createQuery(params)
		const url = `${API_URL}/lawyers/responses${query}`

		return httpClientWithAuth(url, {
			method: 'GET',
		})
	},

	historyResponses: (params: { page?: number; per_page?: number } = {}) => {
		const query = createQuery(params)
		const url = `${API_URL}/lawyers/responses/history${query}`

		return httpClientWithAuth(url, {
			method: 'GET',
		})
	},

	workOut: (id: number) =>
		httpClientWithAuth(`${API_URL}/lawyers/responses/${id}/work-out`, {
			method: 'POST',
		}),
}
