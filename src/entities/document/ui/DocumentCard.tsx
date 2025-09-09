'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { LawyerDocument } from '@/shared/api'
import { DeleteDocumentButton } from '@/features/document-management'
import s from './DocumentCard.module.scss'

export type DocumentCardProps = {
	document: LawyerDocument
	onDocumentDeleted?: () => void
}

export const DocumentCard = ({ document, onDocumentDeleted }: DocumentCardProps) => {
	const t = useTranslations('profile.documents')

	const renderSingleDocument = () => {
		if (!document.link) return null

		const fileName = document.link.split('/').pop()
		
		return (
			<div className={s.documentItem}>
				<div className={s.documentInfo}>
					<p className={s.docName}>{document.name}</p>
					<div className={s.featuresDoc}>
						<a
							href={document.link}
							target="_blank"
							rel="noopener noreferrer"
							className={s.docLink}>
							{fileName}
						</a>
						<DeleteDocumentButton
							documentId={document.id_to_delete}
							onDelete={onDocumentDeleted}
							className={s.trashIcon}
						/>
					</div>
					<p className={s.docStatus}>
						{t('status')}: <span className={s[document.status?.type || '']}>{document.status?.title || t('noStatus')}</span>
					</p>
				</div>
			</div>
		)
	}

	const renderDoubleSidedDocument = () => {
		if (!document.is_double_sided || !document.sides || !Array.isArray(document.sides)) return null

		const sides = document.sides as any[]
		return sides
			.filter((side) => !!side.link)
			.map((side) => {
				const fileName = side.link.split('/').pop()
				
				return (
					<div key={`${document.id}-${side.id_to_delete}`} className={s.documentItem}>
						<div className={s.documentInfo}>
							<p className={s.docName}>
								{document.name} ({side.is_front_side ? t('frontSide') : t('backSide')})
							</p>
							<div className={s.featuresDoc}>
								<a
									href={side.link}
									target="_blank"
									rel="noopener noreferrer"
									className={s.docLink}>
									{fileName}
								</a>
								<DeleteDocumentButton
									documentId={side.id_to_delete}
									onDelete={onDocumentDeleted}
									className={s.trashIcon}
								/>
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

	return (
		<>
			{document.is_double_sided ? renderDoubleSidedDocument() : renderSingleDocument()}
		</>
	)
}
