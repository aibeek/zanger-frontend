import { API_URL } from '../../config'
import { esdcaHttp, encryptId } from '../esdcaCrypto'
import { authService } from '@/features/auth'
import { createQuery } from '../../lib/helpers/query'

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
  is_active?: boolean
  is_verified?: boolean
}

export const counterpartiesApi = {
  search: (params?: { query?: string; q?: string; page?: number; limit?: number }) => {
    const effectiveParams = {
      ...(params || {}),
      query: params?.query ?? params?.q ?? '',
    }
    const query = createQuery(effectiveParams)
    const url = `${API_URL}/counterparties/search${query}`
    return esdcaHttp(url, { method: 'GET' })
  },

  getByUserId: async (userId: number) => {
    const tokened = await encryptId(userId, authService.ensureToken())
    return esdcaHttp(`${API_URL}/counterparties/by-user/${tokened}`, { method: 'GET' })
  },

  getByCreatorId: async (userId: number) => {
    const tokened = await encryptId(userId, authService.ensureToken())
    return esdcaHttp(`${API_URL}/counterparties/by-creator/${tokened}`, { method: 'GET' })
  },

  getMatchesForMe: () => esdcaHttp(`${API_URL}/counterparties/matches/mine`, { method: 'GET' }),

  store: (payload: CounterpartyPayload) =>
    esdcaHttp(`${API_URL}/counterparties`, { method: 'POST', encryptBody: true, body: JSON.stringify(payload) }),

  storeMine: (payload: CounterpartyPayload) =>
    esdcaHttp(`${API_URL}/counterparties/mine`, { method: 'POST', encryptBody: true, body: JSON.stringify(payload) }),

  update: async (id: number, payload: Partial<CounterpartyPayload>) => {
    const tokened = await encryptId(id, authService.ensureToken())
    return esdcaHttp(`${API_URL}/counterparties/${tokened}`, { method: 'PUT', encryptBody: true, body: JSON.stringify(payload) })
  },

  destroy: async (id: number) => {
    const tokened = await encryptId(id, authService.ensureToken())
    return esdcaHttp(`${API_URL}/counterparties/${tokened}`, { method: 'DELETE' })
  },
}