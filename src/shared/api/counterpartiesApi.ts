import { API_URL } from '../config'
import { httpClientWithAuth } from './httpClient'
import { createQuery } from '../lib/helpers/query'

export type CounterpartyTypeCode = 'UL' | 'IP' | 'FL'

export interface CounterpartyPayload {
  name: string
  iin_bin: string
  type: CounterpartyTypeCode
  email?: string
  phone?: string
  legal_address?: string
  bank_details?: string
  user_id?: number | null
}

export const counterpartiesApi = {
  // Backend expects `query` param; support both but map to `query`
  search: (params?: { query?: string; q?: string; page?: number; limit?: number }) => {
    const effectiveParams = {
      ...(params || {}),
      query: params?.query ?? params?.q ?? '',
    }
    const query = createQuery(effectiveParams)
    const url = `${API_URL}/counterparties/search${query}`
    return httpClientWithAuth(url, { method: 'GET' })
  },

  getByUserId: (userId: number) =>
    httpClientWithAuth(`${API_URL}/counterparties/by-user/${userId}`, {
      method: 'GET',
    }),

  getByCreatorId: (userId: number) =>
    httpClientWithAuth(`${API_URL}/counterparties/by-creator/${userId}`, {
      method: 'GET',
    }),

  store: (payload: CounterpartyPayload) =>
    httpClientWithAuth(`${API_URL}/counterparties`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Create counterparty entry specifically for "My Statuses" section
  storeMine: (payload: CounterpartyPayload) =>
    httpClientWithAuth(`${API_URL}/counterparties/mine`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: number, payload: Partial<CounterpartyPayload>) =>
    httpClientWithAuth(`${API_URL}/counterparties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  destroy: (id: number) =>
    httpClientWithAuth(`${API_URL}/counterparties/${id}`, {
      method: 'DELETE',
    }),
}