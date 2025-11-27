import { API_URL } from '../../config'
import { authService } from '@/features/auth'
import { esdcaHttp, encryptId } from '../esdcaCrypto'
import { createQuery } from '../../lib/helpers/query'

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
  signers?: { id: number; fio: string | null; iin_bin?: string | null; email?: string | null; role: string | null; status: string | null; signed_at: string | null; stage_no: number | null }[]
  files?: { file_name: string; file_type: string; storage_object_id?: number; object_id?: number; document_file_id?: number }[]
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
    return esdcaHttp(`${API_URL}/dictionaries/document-types`, {
      method: 'GET',
    })
  },

  createDocument: (payload: EsdcaDocumentCreatePayload): Promise<EsdcaCreateResponse> => {
    return esdcaHttp(`${API_URL}/documents`, {
      method: 'POST',
      encryptBody: true,
      body: JSON.stringify(payload),
    })
  },

  uploadMainFile: (documentId: number, file: File): Promise<StorageUploadSingleResult | StorageUploadMultiResult> => {
    const formData = new FormData()
    formData.append('document_id', String(documentId))
    formData.append('file_type', 'MAIN')
    formData.append('file', file)

    return esdcaHttp(`${API_URL}/storage/upload`, {
      method: 'POST',
      encryptBody: true,
      body: formData,
    })
  },

  getDocumentDetails: async (id: number): Promise<EsdcaDocumentDetails> => {
    const tokened = await encryptId(id, authToken())
    return esdcaHttp(`${API_URL}/documents/${tokened}`, { method: 'GET', encryptBody: true })
  },

  viewDocument: async (id: number): Promise<{ success?: boolean }> => {
    const tokened = await encryptId(id, authToken())
    return esdcaHttp(`${API_URL}/documents/${tokened}/view`, {
      method: 'POST',
      encryptBody: true,
      body: JSON.stringify({}),
    })
  },

  listDocuments: (
    params?: { status?: string; inbox?: boolean; outbox?: boolean; page?: number; limit?: number; q?: string }
  ): Promise<{ data: any[]; pagination?: any }> => {
    const query = createQuery(params || {})
    return esdcaHttp(`${API_URL}/documents${query}`, {
      method: 'GET',
      encryptBody: true,
    })
  },

  getCounters: (): Promise<{ incoming_new: number }> => {
    return esdcaHttp(`${API_URL}/documents/counters`, { method: 'GET', encryptBody: true })
  },

  addSigners: async (
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
    const tokened = await encryptId(documentId, authToken())
    return esdcaHttp(`${API_URL}/documents/${tokened}/routing/add-signers`, {
      method: 'POST',
      encryptBody: true,
      body: JSON.stringify({ signers }),
    })
  },

  sendForSigning: async (documentId: number): Promise<{ success?: boolean }> => {
    const tokened = await encryptId(documentId, authToken())
    return esdcaHttp(`${API_URL}/documents/${tokened}/routing/send`, {
      method: 'POST',
      encryptBody: true,
      body: JSON.stringify({}),
    })
  },

  firstSign: async (
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
    const tokened = await encryptId(documentId, authToken())
    return esdcaHttp(`${API_URL}/documents/${tokened}/routing/first-sign`, {
      method: 'POST',
      encryptBody: true,
      body: JSON.stringify(payload),
    })
  },

  signInitiate: async (
    documentId: number,
    method: 'SIGN_CMS' | 'SIGN_XML' = 'SIGN_XML',
    options?: { counterparty_id?: number }
  ): Promise<{ operation_id: number; challenge: string }> => {
    const body: any = { method }
    if (options?.counterparty_id) body.counterparty_id = options.counterparty_id
    const tokened = await encryptId(documentId, authToken())
    return esdcaHttp(`${API_URL}/documents/${tokened}/sign`, {
      method: 'POST',
      encryptBody: true,
      body: JSON.stringify(body),
    })
  },

  signVerify: async (
    documentId: number,
    payload: { operation_id: number; cms: string; tax_id: string }
  ): Promise<{ valid: boolean; status: string; document_status?: string }> => {
    const tokened = await encryptId(documentId, authToken())
    return esdcaHttp(`${API_URL}/documents/${tokened}/sign/verify`, {
      method: 'POST',
      encryptBody: true,
      body: JSON.stringify(payload),
    })
  },

  signComplete: async (
    documentId: number,
    payload: { operation_id: number; cms: string; certificate?: string | null }
  ): Promise<{ success: boolean; status: string }> => {
    const tokened = await encryptId(documentId, authToken())
    return esdcaHttp(`${API_URL}/documents/${tokened}/sign/complete`, {
      method: 'POST',
      encryptBody: true,
      body: JSON.stringify(payload),
    })
  },

  decline: async (
    documentId: number,
    declined_reason: string
  ): Promise<{ success: boolean; status: string }> => {
    const tokened = await encryptId(documentId, authToken())
    return esdcaHttp(`${API_URL}/documents/${tokened}/decline`, {
      method: 'POST',
      encryptBody: true,
      body: JSON.stringify({ declined_reason }),
    })
  },

  archiveDocument: async (documentId: number): Promise<{ success?: boolean; status?: string }> => {
    const tokened = await encryptId(documentId, authToken())
    return esdcaHttp(`${API_URL}/documents/${tokened}/archive`, {
      method: 'POST',
      encryptBody: true,
      body: JSON.stringify({}),
    })
  },

  removeDocument: async (documentId: number): Promise<{ success?: boolean; status?: string }> => {
    const tokened = await encryptId(documentId, authToken())
    return esdcaHttp(`${API_URL}/documents/${tokened}/remove`, {
      method: 'POST',
      encryptBody: true,
      body: JSON.stringify({}),
    })
  },

  unarchiveDocument: async (documentId: number): Promise<{ success?: boolean; status?: string }> => {
    const tokened = await encryptId(documentId, authToken())
    return esdcaHttp(`${API_URL}/documents/${tokened}/unarchive`, {
      method: 'POST',
      encryptBody: true,
      body: JSON.stringify({}),
    })
  },

  trashRestore: (ids: number[]): Promise<{ success?: boolean; restored?: number; errors?: any[] }> => {
    return esdcaHttp(`${API_URL}/documents/trash/restore`, {
      method: 'POST',
      encryptBody: true,
      body: JSON.stringify({ ids }),
    })
  },

  trashPurge: (ids: number[]): Promise<{ success?: boolean; deleted?: number; errors?: any[] }> => {
    return esdcaHttp(`${API_URL}/documents/trash/purge`, {
      method: 'POST',
      encryptBody: true,
      body: JSON.stringify({ ids }),
    })
  },

  deleteDocument: async (documentId: number): Promise<{ success?: boolean; status?: string }> => {
    const tokened = await encryptId(documentId, authToken())
    return esdcaHttp(`${API_URL}/documents/${tokened}`, { method: 'DELETE', encryptBody: true })
  },
}

function authToken(): string { return authService.ensureToken() }