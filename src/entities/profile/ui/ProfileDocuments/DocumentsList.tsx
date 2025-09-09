'use client'

import React from 'react'
import { LawyerDocument } from '@/shared/api'
import { DocumentsList as DocumentsListWidget } from '@/widgets/DocumentsList'

type Props = {
	documents: LawyerDocument[]
	mutate: () => void
}

export const DocumentsList = ({ documents, mutate }: Props) => {

	return (
		<DocumentsListWidget 
			documents={documents} 
			onDocumentDeleted={mutate} 
		/>
	)
}
