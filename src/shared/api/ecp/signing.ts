import { API_URL } from '../../config'
import { esdcaHttp, encryptId } from '../esdcaCrypto'
import { authService } from '@/features/auth'

export interface VerifyWithTaxIdPayload {
  tax_id: string
  cms?: string
  challenge?: string
  xml?: string
}

export interface VerifyWithTaxIdResponse {
  valid: boolean
  message: string
  matched_source?: string
  error?: string
}

export const signingApi = {
  verifyWithTaxId: (payload: VerifyWithTaxIdPayload) =>
    esdcaHttp(`${API_URL}/signing/verify-with-tax-id`, {
      method: 'POST',
      encryptBody: true,
      body: JSON.stringify(payload),
    }) as Promise<VerifyWithTaxIdResponse>,

  pingNcanode: () =>
    esdcaHttp(`${API_URL}/signing/ncanode/ping`, {
      method: 'GET',
    }),

  rollbackInitiate: async (documentId: number, payload: { counterparty_id: number; operation_id?: number }) => {
    const tokened = await encryptId(documentId, authService.ensureToken())
    return esdcaHttp(`${API_URL}/documents/${tokened}/sign/rollback-init`, {
      method: 'POST',
      encryptBody: true,
      body: JSON.stringify(payload),
    })
  },
}
