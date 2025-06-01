'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import s from './DocumentsList.module.scss'
import { Button } from '@/shared/ui-kit'
import { useLawyerDocumentsStore } from '../../model'
import { TrashIcon } from '@heroicons/react/20/solid'
import { LawyerDocument } from '@/shared/api'

type Props = {
	documents: LawyerDocument[]
	mutate: () => void
}
export const DocumentsList = ({ documents, mutate }: Props) => {
	const t = useTranslations()
	const { deleteDocumentById } = useLawyerDocumentsStore()

	const handleDelete = async (id: number, mutate: () => void) => {
		await deleteDocumentById(id, mutate)
	}

	return (
		<div
			style={{ marginTop: 24 }}
			className={s.documentsList}>
			{documents
				.filter((doc) => doc.link)
				.map((doc) => {
					const fileName = doc.link.split('/').pop()

					return (
						<div
							key={doc.id}
							className={s.documentItem}>
							<div className={s.documentInfo}>
								<p className={s.docName}>{doc.name}</p>

								<div className={s.featuresDoc}>
									<a
										href={doc.link}
										target="_blank"
										rel="noopener noreferrer"
										className={s.docLink}>
										{fileName}
									</a>

									<Button
										variant="clear"
										size="sm"
										onClick={() => handleDelete(doc.id_to_delete, mutate)}>
										<TrashIcon
											width={16}
											height={16}
											color={'rgba(156, 155, 153, 1)'}
											className={s.trashIcon}
										/>
									</Button>
								</div>

								<p className={s.docStatus}>
									Статус: <span className={s[doc.status?.type || '']}>{doc.status?.title || 'Статус отсутствует'}</span>
								</p>
							</div>
						</div>
					)
				})}
		</div>
	)
}
