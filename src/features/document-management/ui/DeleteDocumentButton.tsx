'use client'

import React from 'react'
import { Button } from '@/shared/ui-kit'
import { TrashIcon } from '@heroicons/react/20/solid'
import { useDeleteDocument } from '../model/useDeleteDocument'

type Props = {
	documentId: number
	onDelete?: () => void
	className?: string
}

export const DeleteDocumentButton = ({ documentId, onDelete, className }: Props) => {
	const { deleteDocument } = useDeleteDocument()

	const handleDelete = async () => {
		await deleteDocument(documentId, onDelete)
	}

	return (
		<Button
			variant="clear"
			size="sm"
			onClick={handleDelete}
			className={className}>
			<TrashIcon
				width={16}
				height={16}
				color={'rgba(156, 155, 153, 1)'}
			/>
		</Button>
	)
}
