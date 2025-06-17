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
	const t = useTranslations('profile.documents')
	const { deleteDocumentById } = useLawyerDocumentsStore()

	const handleDelete = async (id: number, mutate: () => void) => {
		await deleteDocumentById(id, mutate)
	}

	return (
		<div
			style={{ marginTop: 24 }}
			className={s.documentsList}>
			{documents.flatMap((doc) => {
				if (doc.is_double_sided && Array.isArray(doc.sides)) {
					// @ts-expect-error fix it
					return doc.sides
						.filter((side) => !!side.link)
						.map((side) => {
							const fileName = side.link.split('/').pop()
							return (
								<div
									key={`${doc.id}-${side.id_to_delete}`}
									className={s.documentItem}>
									<div className={s.documentInfo}>
										<p className={s.docName}>
											{doc.name} ({side.is_front_side ? t('frontSide') : t('backSide')})
										</p>
										<div className={s.featuresDoc}>
											<a
												href={side.link}
												target="_blank"
												rel="noopener noreferrer"
												className={s.docLink}>
												{fileName}
											</a>
											<Button
												variant="clear"
												size="sm"
												onClick={() => handleDelete(side.id_to_delete, mutate)}>
												<TrashIcon
													width={16}
													height={16}
													color={'rgba(156, 155, 153, 1)'}
													className={s.trashIcon}
												/>
											</Button>
										</div>
										<p className={s.docStatus}>
											{t('status')}:{' '}
											<span className={s[side.status?.type || '']}>{side.status?.title || t('noStatus')}</span>
										</p>
									</div>
								</div>
							)
						})
				}

				if (doc.link) {
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
									{t('status')}: <span className={s[doc.status?.type || '']}>{doc.status?.title || t('noStatus')}</span>
								</p>
							</div>
						</div>
					)
				}

				return []
			})}
		</div>
	)
}
