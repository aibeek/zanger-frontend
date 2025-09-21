'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { CreateApplicationForm } from '@/features/create-application'
import { MyApplicationsList } from './MyApplicationsList'
import { EditApplicationModal } from './EditApplicationModal'
import { Application } from '@/shared/api'
import s from './ClientApplicationsView.module.scss'

export const ClientApplicationsView = () => {
	const t = useTranslations('createApplications')
	const [editingApplication, setEditingApplication] = useState<Application | null>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)

	const handleEdit = (application: Application) => {
		setEditingApplication(application)
		setIsModalOpen(true)
	}

	const handleCloseModal = () => {
		setIsModalOpen(false)
		setEditingApplication(null)
	}

	const handleEditSuccess = () => {
		// Обновление списка заявок произойдет автоматически через ключ компонента
		window.location.reload() // Простое решение для обновления
	}

	return (
		<>
			<div className={s.container}>
				<div className={s.leftColumn}>
					<div className={s.section}>
						<h2 className={s.sectionTitle}>
							Создать новую заявку
						</h2>
						<CreateApplicationForm />
					</div>
				</div>
				
				<div className={s.rightColumn}>
					<div className={s.section}>
						<h2 className={s.sectionTitle}>
							Мои заявки
						</h2>
						<MyApplicationsList onEdit={handleEdit} />
					</div>
				</div>
			</div>

			<EditApplicationModal
				application={editingApplication}
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				onSuccess={handleEditSuccess}
			/>
		</>
	)
}
