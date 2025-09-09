import { useLawyerDocumentsStore } from '@/entities/profile/model'
import { useTranslations } from 'next-intl'

export const useDeleteDocument = () => {
	const t = useTranslations('profile.documents')
	const { deleteDocumentById } = useLawyerDocumentsStore()

	const deleteDocument = async (id: number, onSuccess?: () => void) => {
		await deleteDocumentById(id, onSuccess || (() => {}), t)
	}

	return { deleteDocument }
}
