import { API_URL } from '../config'
import { httpClientWithAuth } from './httpClient'

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
}