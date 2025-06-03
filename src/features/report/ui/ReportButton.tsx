'use client'

import { useState } from 'react'
import { Button, Modal } from '@/shared/ui-kit'
import s from './ReportButton.module.scss'
import { useReport } from '../model'
import { Textarea } from '@headlessui/react'
import { RoleVariant } from '@/shared/lib'
import { useTranslations } from 'next-intl'

interface ComplainButtonProps {
	userId: number
	role: RoleVariant
}

export const ReportButton = ({ userId, role }: ComplainButtonProps) => {
	const { report, reportedIds } = useReport()
	const hasReported = reportedIds.includes(userId)
	const [isOpen, setIsOpen] = useState(false)
	const [description, setDescription] = useState('')
	const t = useTranslations('report')

	const handleSubmit = () => {
		if (!description.trim()) return
		report(userId, role, description)
		setIsOpen(false)
		setDescription('')
	}

	return (
		<>
			<Button
				variant="clear"
				onClick={() => setIsOpen(true)}
				disabled={hasReported}
				className={`${s.reportBtn} ${hasReported ? s.reported : ''}`}>
				{hasReported ? t('alreadyReported') : t('report')}
			</Button>

			<Modal
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				className={s.modal}
				title={t('modalTitle')}>
				<div className={s.modalContent}>
					<Textarea
						placeholder={t('placeholder')}
						value={description}
						className={s.textarea}
						onChange={(e) => setDescription(e.target.value)}
					/>
					<Button
						onClick={handleSubmit}
						disabled={!description.trim()}>
						{t('submit')}
					</Button>
				</div>
			</Modal>
		</>
	)
}
