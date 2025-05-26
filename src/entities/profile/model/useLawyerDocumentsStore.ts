import useSWR from 'swr'
import { create } from 'zustand'
import toast from 'react-hot-toast'
import { profileApi } from '@/shared/api'
import type { LawyerDocument } from '@/shared/api'

interface LawyerDocumentsState {
	selectedFiles: File[]
	selectedDocumentId: number | null
	frontSide: 0 | 1 | null

	setSelectedFiles: (files: File[]) => void
	addSelectedFile: (file: File) => void
	removeSelectedFile: (fileName: string) => void

	setSelectedDocumentId: (id: number | null) => void
	setFrontSide: (side: 0 | 1) => void

	uploadFiles: (mutate: () => void) => Promise<void>
	deleteDocumentById: (id: number, mutate: () => void) => Promise<void>
}

export const useLawyerDocumentsStore = create<LawyerDocumentsState>((set, get) => ({
	selectedFiles: [],
	selectedDocumentId: null,
	frontSide: null,

	setSelectedFiles: (files) => set({ selectedFiles: files }),

	addSelectedFile: (file) =>
		set((state) => ({
			selectedFiles: [...state.selectedFiles, file],
		})),

	removeSelectedFile: (fileName) =>
		set((state) => ({
			selectedFiles: state.selectedFiles.filter((f) => f.name !== fileName),
		})),

	setSelectedDocumentId: (id) => set({ selectedDocumentId: id }),
	setFrontSide: (side) => set({ frontSide: side }),

	uploadFiles: async (mutate) => {
		const { selectedFiles, selectedDocumentId, setSelectedFiles } = get()

		if (!selectedDocumentId) {
			toast.error('Документ не выбран')
			return
		}

		if (selectedFiles.length === 0) {
			toast.error('Файлы не выбраны')
			return
		}

		try {
			for (const file of selectedFiles) {
				const formData = new FormData()
				formData.append('document_id', selectedDocumentId.toString())
				formData.append('front_side', '0')
				formData.append('file', new Blob([file], { type: file.type }), file.name)
				mutate()
				await profileApi.uploadDocument(formData)
			}
			mutate()
			toast.success('Документ(ы) успешно загружены')
			setSelectedFiles([])
		} catch (e) {
			console.error('Ошибка при загрузке документа', e)
			toast.error('Ошибка при загрузке документа')
		}
	},

	deleteDocumentById: async (idToDelete, mutate) => {
		if (!idToDelete) {
			toast.error('Документ нельзя удалить — отсутствует id')
			return
		}

		try {
			await profileApi.deleteDocument(idToDelete)
			toast.success('Документ удалён')
			mutate()
		} catch (e) {
			console.error('Ошибка при удалении документа', e)
			toast.error('Ошибка при удалении документа')
		}
	},
}))

export const fetchDocuments = async (): Promise<LawyerDocument[]> => {
	const res = await profileApi.myDocuments()

	// @ts-expect-error — если нужно временно, но лучше пофиксить типизацию profileApi
	return res
}

export const useDocuments = () => {
	const { data, error, isValidating, mutate } = useSWR('lawyer-documents', fetchDocuments)

	return {
		documents: data ?? [],
		loading: isValidating,
		error,
		mutate,
	}
}
