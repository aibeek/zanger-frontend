import useSWR from 'swr'
import { create } from 'zustand'
import toast from 'react-hot-toast'
import { profileApi } from '@/shared/api'
import type { LawyerDocument } from '@/shared/api'
import { refreshUser } from '@/shared/lib/helpers/refreshUser'

interface LawyerDocumentsState {
	selectedFiles: File[]
	selectedDocumentId: number | null
	frontSide: 0 | 1 | null
	isDoubleSided: boolean

	setSelectedFiles: (files: File[]) => void
	addSelectedFile: (file: File) => void
	removeSelectedFile: (fileName: string) => void

	setSelectedDocument: (id: number | null, isDoubleSided: boolean) => void
	setFrontSide: (side: 0 | 1) => void

	uploadFiles: (mutate: () => void) => Promise<void>
	deleteDocumentById: (id: number, mutate: () => void) => Promise<void>
}

export const useLawyerDocumentsStore = create<LawyerDocumentsState>((set, get) => ({
	selectedFiles: [],
	selectedDocumentId: null,
	frontSide: null,
	isDoubleSided: false,

	setSelectedFiles: (files) => set({ selectedFiles: files }),
	addSelectedFile: (file) => set((state) => ({ selectedFiles: [...state.selectedFiles, file] })),
	removeSelectedFile: (fileName) =>
		set((state) => ({
			selectedFiles: state.selectedFiles.filter((f) => f.name !== fileName),
		})),

	setSelectedDocument: (id, isDoubleSided) =>
		set({ selectedDocumentId: id, isDoubleSided, frontSide: isDoubleSided ? null : 0 }),

	setFrontSide: (side) => set({ frontSide: side }),

	uploadFiles: async (mutate) => {
		const { selectedFiles, selectedDocumentId, frontSide, isDoubleSided, setSelectedFiles } = get()

		if (!selectedDocumentId) {
			toast.error('Документ не выбран')
			return
		}

		if (selectedFiles.length === 0) {
			toast.error('Файлы не выбраны')
			return
		}

		if (isDoubleSided && frontSide === null) {
			toast.error('Выберите сторону документа')
			return
		}

		try {
			for (const file of selectedFiles) {
				const formData = new FormData()
				formData.append('document_id', selectedDocumentId.toString())
				formData.append('front_side', isDoubleSided ? String(frontSide === 1 ? 1 : 0) : '0')
				formData.append('file', file)
				await profileApi.uploadDocument(formData)
			}
			toast.success('Документ успешно загружен')
			setSelectedFiles([])
			await refreshUser()
			mutate()
		} catch (e) {
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
			await refreshUser()
		} catch (e) {
			toast.error('Ошибка при удалении документа')
		}
	},
}))

export const fetchDocuments = async (): Promise<LawyerDocument[]> => {
	const res = await profileApi.myDocuments()

	// @ts-expect-error — fix it
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
