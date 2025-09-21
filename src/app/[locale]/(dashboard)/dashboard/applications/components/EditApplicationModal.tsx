'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'

import { Button } from '@/shared/ui-kit'
import { CreateApplicationForm } from '@/features/create-application'
import { Application } from '@/shared/api'

import s from './EditApplicationModal.module.scss'

interface EditApplicationModalProps {
	application: Application | null
	isOpen: boolean
	onClose: () => void
	onSuccess: () => void
}

export const EditApplicationModal = ({ 
	application, 
	isOpen, 
	onClose, 
	onSuccess 
}: EditApplicationModalProps) => {
	const t = useTranslations('createApplications')

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = 'unset'
		}

		return () => {
			document.body.style.overflow = 'unset'
		}
	}, [isOpen])

	if (!isOpen || !application) return null

	const handleSuccess = () => {
		onSuccess()
		onClose()
	}

	return (
		<div className={s.overlay} onClick={onClose}>
			<div className={s.modal} onClick={(e) => e.stopPropagation()}>
				<div className={s.header}>
					<h2 className={s.title}>{t('editApplication')}</h2>
					<Button
						variant="secondary"
						onClick={onClose}
						className={s.closeBtn}>
						×
					</Button>
				</div>
				
				<div className={s.content}>
					<CreateApplicationForm
						applicationId={application.id}
						onSuccess={handleSuccess}
					/>
				</div>
			</div>
		</div>
	)
}