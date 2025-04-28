import { httpClientWithAuth } from './httpClient'
import { baseApiURI } from '../lib/consts'

type Tag = {
	id: number
	name: string
}

export type ApplicationHistoryItem = {
	id: number
	description: string
	created_at: string
	responses: any[]
	responses_count: number
	status: 'Опубликован' | 'На модерации' | 'Отменен' | 'Отклонен'
	tag: Tag | null
}

export interface CreateApplicationType {
	description: string
	region_id: number
	tag_id?: number
}

export interface CancelApplicationType {
	cancel_reason: string
	application_id: number
}

export const applicationApi = {
	createApplication: (data: CreateApplicationType) =>
		httpClientWithAuth(`${baseApiURI}/clients/orders`, {
			method: 'POST',
			body: JSON.stringify(data),
		}),

	cancelApplication: (data: CancelApplicationType) =>
		httpClientWithAuth(`${baseApiURI}/clients/orders/${data.application_id}/cancel`, {
			method: 'PUT',
			body: JSON.stringify(data),
		}),

	historyApplications: () =>
		httpClientWithAuth(`${baseApiURI}/clients/orders/history`, {
			method: 'GET',
		}),

	getApplications: () =>
		httpClientWithAuth(`${baseApiURI}/clients/orders/my`, {
			method: 'GET',
		}),
}
