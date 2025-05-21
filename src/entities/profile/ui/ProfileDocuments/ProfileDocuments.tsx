import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Button, Input } from '@/shared/ui-kit'
import medalIcon from '@/app/assets/icons/medal.svg'

import s from './ProfileDocuments.module.scss'
import { ProfileTabWrapper } from '../ProfileTabWrapper'
import { deleteDocument, uploadDocument, useLawyerDocumentsStore, useDocuments } from '../../model'

const DOCUMENT_TYPES = [
	{ id: 1, name: 'Удостоверение личности' },
	{ id: 2, name: 'Диплом' },
]

export const ProfileDocuments = () => {
	const t = useTranslations()
	const { selectedFile, selectedDocumentId, setSelectedFile, setSelectedDocumentId } = useLawyerDocumentsStore()
	const { documents, loading, error, mutate } = useDocuments()

	// Локальный стейт загрузки для операций upload/delete
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setSelectedFile(e.target.files[0])
		}
	}

	const handleUpload = async () => {
		if (!selectedFile) {
			alert('Пожалуйста, выберите файл для загрузки')
			return
		}
		if (!selectedDocumentId) {
			alert('Пожалуйста, выберите тип документа')
			return
		}

		const formData = new FormData()
		formData.append('file', selectedFile)
		formData.append('document_id', String(selectedDocumentId))

		setIsSubmitting(true)
		await uploadDocument(formData, mutate)
		setSelectedFile(null)
		setSelectedDocumentId(null)
		setIsSubmitting(false)
	}

	const handleDelete = async (id: number) => {
		setIsSubmitting(true)
		await deleteDocument(id, mutate)
		setIsSubmitting(false)
	}

	return (
		<ProfileTabWrapper
			title={t('profile.documents.title')}
			imgSrc={medalIcon}
			imgAlt="personalData"
			panel_title={t('profile.documents.panelTitle')}
			panel_descr={t('profile.documents.panelDescription')}>
			{loading && <p>Загрузка...</p>}

			{!loading && documents.length === 0 && <h6 className={s.empty}>У вас нет загруженных документов</h6>}

			<div style={{ marginBottom: 12 }}>
				<select
					value={selectedDocumentId ?? ''}
					onChange={(e) => setSelectedDocumentId(Number(e.target.value))}
					style={{ marginRight: 12 }}
					disabled={isSubmitting}>
					<option
						value=""
						disabled>
						Выберите тип документа
					</option>
					{DOCUMENT_TYPES.map((type) => (
						<option
							key={type.id}
							value={type.id}>
							{type.name}
						</option>
					))}
				</select>

				<Input
					type="file"
					onChange={handleFileChange}
					disabled={isSubmitting}
				/>
			</div>

			<Button
				variant="primary"
				size="sm"
				onClick={handleUpload}
				disabled={!selectedFile || !selectedDocumentId || isSubmitting}>
				Загрузить документ
			</Button>

			<div style={{ marginTop: 24 }}>
				{documents.map((doc) => (
					<div
						key={doc.document_id}
						style={{ marginBottom: 8 }}>
						<span>{doc.name}</span>

						{doc.data ? (
							<a
								href={doc.data}
								target="_blank"
								rel="noopener noreferrer"
								style={{ marginLeft: 12 }}>
								Скачать
							</a>
						) : (
							<span style={{ marginLeft: 12, fontStyle: 'italic', color: 'gray' }}>Файл не загружен</span>
						)}

						<Button
							variant="primary"
							size="sm"
							onClick={() => handleDelete(doc.document_id)}
							style={{ marginLeft: 12 }}
							disabled={isSubmitting}>
							Удалить
						</Button>
					</div>
				))}
			</div>
		</ProfileTabWrapper>
	)
}
