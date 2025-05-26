import { useState } from 'react'
import { Button, Modal } from '@/shared/ui-kit'
import s from './ReportButton.module.scss'
import { useReport } from '../model'
import { Textarea } from '@headlessui/react'

interface ComplainButtonProps {
	userId: number
	role: 'client' | 'lawyer'
}

export const ReportButton = ({ userId, role }: ComplainButtonProps) => {
	const { report, reportedIds } = useReport()
	const hasReported = reportedIds.includes(userId)

	const [isOpen, setIsOpen] = useState(false)
	const [description, setDescription] = useState('')

	const handleSubmit = () => {
		if (!description.trim()) {
			return
		}
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
				{hasReported ? 'Жалоба отправлена' : 'Пожаловаться'}
			</Button>

			<Modal
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				className={s.modal}
				title="Оставить жалобу">
				<div className={s.modalContent}>
					<Textarea
						placeholder="Опишите причину жалобы"
						value={description}
						className={s.textarea}
						onChange={(e) => setDescription(e.target.value)}
					/>
					<Button
						onClick={handleSubmit}
						disabled={!description.trim()}>
						Отправить жалобу
					</Button>
				</div>
			</Modal>
		</>
	)
}
