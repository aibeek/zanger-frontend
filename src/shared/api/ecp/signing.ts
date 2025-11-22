import { API_URL } from '../../config'
import { httpClientWithAuth } from '../httpClient'

export interface VerifyWithTaxIdPayload {
  tax_id: string
  cms: string
  challenge: string
}

export interface VerifyWithTaxIdResponse {
  valid: boolean
  message: string
  matched_source?: string
  error?: string
}

export const signingApi = {
  verifyWithTaxId: (payload: VerifyWithTaxIdPayload) =>
    httpClientWithAuth(`${API_URL}/signing/verify-with-tax-id`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as Promise<VerifyWithTaxIdResponse>,

  pingNcanode: () =>
    httpClientWithAuth(`${API_URL}/signing/ncanode/ping`, {
      method: 'GET',
    }),

  rollbackInitiate: (documentId: number, payload: { counterparty_id: number; operation_id?: number }) =>
    httpClientWithAuth(`${API_URL}/documents/${documentId}/sign/rollback-init`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}
