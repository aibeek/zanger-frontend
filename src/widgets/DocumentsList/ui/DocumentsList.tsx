'use client'

import React from 'react'
import { LawyerDocument } from '@/shared/api'
import { DocumentCard } from '@/entities/document'
import s from './DocumentsList.module.scss'

export type DocumentsListProps = {
	documents: LawyerDocument[]
	onDocumentDeleted?: () => void
}

export const DocumentsList = ({ documents, onDocumentDeleted }: DocumentsListProps) => {
	return (
		<div className={s.documentsList}>
			{documents.map((document) => (
				<DocumentCard
					key={document.id}
					document={document}
					onDocumentDeleted={onDocumentDeleted}
				/>
			))}
		</div>
	)
}
