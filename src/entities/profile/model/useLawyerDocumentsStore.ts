import { create } from 'zustand'
import toast from 'react-hot-toast'
import useSWR from 'swr'
import { profileApi } from '@/shared/api'

interface LawyerDocument {
	document_id: number
	is_double_sided: boolean
	name: string
	data: any
}

interface LawyerDocumentsState {
	selectedFile: File | null
	selectedDocumentId: number | null

	setSelectedFile: (file: File | null) => void
	setSelectedDocumentId: (id: number | null) => void
}

export const useLawyerDocumentsStore = create<LawyerDocumentsState>((set) => ({
	selectedFile: null,
	selectedDocumentId: null,

	setSelectedFile: (file) => set({ selectedFile: file }),
	setSelectedDocumentId: (id) => set({ selectedDocumentId: id }),
}))

const fetchDocuments = async (): Promise<LawyerDocument[]> => {
	const res = await profileApi.myDocuments()
	// @ts-expect-error fix typing
	return res.data
}

export const useDocuments = () => {
	const { data, error, isLoading, mutate } = useSWR('lawyer-documents', fetchDocuments)

	return {
		documents: data ?? [],
		loading: isLoading,
		error,
		mutate,
	}
}

export const uploadDocument = async (formData: FormData, mutate: () => void) => {
	try {
		await profileApi.uploadDocument(formData)
		toast.success('Документ успешно загружен')
		mutate()
	} catch (e) {
		console.error('Ошибка при загрузке документа', e)
		toast.error('Ошибка при загрузке документа')
	}
}

export const deleteDocument = async (id: number, mutate: () => void) => {
	try {
		await profileApi.deleteDocument(id)
		toast.success('Документ удалён')
		mutate()
	} catch (e) {
		console.error('Ошибка при удалении документа', e)
		toast.error('Ошибка при удалении документа')
	}
}
