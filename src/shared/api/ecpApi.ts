import { API_URL } from '../config'
import { httpClientWithAuth } from './httpClient'
import { createQuery } from '../lib/helpers/query'

export type EsdcaDocumentCreatePayload = {
  title: string
  description?: string
  amount?: string | number | null
  document_type_id: number
  require_sender_signature?: boolean
}

export type EsdcaCreateResponse = {
  id: number
  status: string
}

export type EsdcaDocumentType = {
  id: number
  code: string
  name_rus: string
  name_kaz: string
}

export type EsdcaDocumentDetails = {
  id: number
  title: string
  status: string
  document_type?: string | null
  created_by?: { id: number | null; fio: string | null }
  signers?: { id: number; fio: string | null; role: string | null; status: string | null; signed_at: string | null; stage_no: number | null }[]
  files?: { file_name: string; file_type: string }[]
  signatures?: { signer_iin: string | null; signer_fio: string | null; signed_at: string | null; format: string | null }[]
  log?: { event_code: string; created_at: string }[]
}

export type StorageUploadSingleResult = {
  storage_object_id: number
  object_id: number
  document_file_id: number
  document_id: number
  file_type: string
  file_name: string
  bucket: string
  object_key: string
}

export type StorageUploadMultiResult = {
  items: StorageUploadSingleResult[]
}

export const ecpApi = {
  getDocumentTypes: (): Promise<EsdcaDocumentType[]> => {
    return httpClientWithAuth(`${API_URL}/dictionaries/document-types`, {
      method: 'GET',
    })
  },

  createDocument: (payload: EsdcaDocumentCreatePayload): Promise<EsdcaCreateResponse> => {
    return httpClientWithAuth(`${API_URL}/documents`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  uploadMainFile: (documentId: number, file: File): Promise<StorageUploadSingleResult | StorageUploadMultiResult> => {
    const formData = new FormData()
    formData.append('document_id', String(documentId))
    formData.append('file_type', 'MAIN')
    formData.append('file', file)

    return httpClientWithAuth(`${API_URL}/storage/upload`, {
      method: 'POST',
      body: formData,
    })
  },

  getDocumentDetails: (id: number): Promise<EsdcaDocumentDetails> => {
    return httpClientWithAuth(`${API_URL}/documents/${id}`, {
      method: 'GET',
    })
  },

  listDocuments: (
    params?: { status?: string; inbox?: boolean; outbox?: boolean; page?: number; limit?: number }
  ): Promise<{ data: any[]; pagination?: any }> => {
    const query = createQuery(params || {})
    return httpClientWithAuth(`${API_URL}/documents${query}`, {
      method: 'GET',
    })
  },

  addSigners: (
    documentId: number,
    signers: Array<{
      counterparty_id?: number
      signer_iin?: string
      signer_fio?: string
      signer_email?: string
      signer_number?: string
      role: 'SIGNER' | 'APPROVER' | 'CC'
      stage_no: number
      due_at?: string
    }>
  ): Promise<{ success?: boolean }> => {
    return httpClientWithAuth(`${API_URL}/documents/${documentId}/routing/add-signers`, {
      method: 'POST',
      body: JSON.stringify({ signers }),
    })
  },

  sendForSigning: (documentId: number): Promise<{ success?: boolean }> => {
    return httpClientWithAuth(`${API_URL}/documents/${documentId}/routing/send`, {
      method: 'POST',
      body: JSON.stringify({}),
    })
  },

  firstSign: (
    documentId: number,
    payload: {
      cms: string
      initiator: {
        signer_iin: string
        signer_fio: string
        signer_email?: string
        signer_number?: string
      }
      counterparties: Array<{
        counterparty_id?: number
        signer_iin?: string
        signer_fio?: string
        signer_email?: string
        signer_number?: string
        role?: 'SIGNER' | 'APPROVER' | 'CC'
        stage_no?: number
        due_at?: string
      }>
      sign_after_all: boolean
      certificate?: string
    }
  ): Promise<{ success?: boolean; status?: string }> => {
    return httpClientWithAuth(`${API_URL}/documents/${documentId}/routing/first-sign`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  signInitiate: (
    documentId: number,
    method: 'SIGN_CMS' | 'SIGN_XML' = 'SIGN_CMS'
  ): Promise<{ operation_id: number; challenge: string }> => {
    return httpClientWithAuth(`${API_URL}/documents/${documentId}/sign`, {
      method: 'POST',
      body: JSON.stringify({ method }),
    })
  },

  signVerify: (
    documentId: number,
    payload: { operation_id: number; cms: string }
  ): Promise<{ valid: boolean; status: string }> => {
    return httpClientWithAuth(`${API_URL}/documents/${documentId}/sign/verify`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  signComplete: (
    documentId: number,
    payload: { operation_id: number; cms: string; certificate?: string | null }
  ): Promise<{ success: boolean; status: string }> => {
    return httpClientWithAuth(`${API_URL}/documents/${documentId}/sign/complete`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  decline: (
    documentId: number,
    declined_reason: string
  ): Promise<{ success: boolean; status: string }> => {
    return httpClientWithAuth(`${API_URL}/documents/${documentId}/decline`, {
      method: 'POST',
      body: JSON.stringify({ declined_reason }),
    })
  },
}