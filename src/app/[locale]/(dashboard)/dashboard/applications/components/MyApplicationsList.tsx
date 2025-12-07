'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'

import { Button } from '@/shared/ui-kit'
import { clientApi, Application, ApplicationsResponse, Region, Tag } from '@/shared/api'
import { CreateApplicationForm } from '@/features/create-application'
import { OrderResponsesModal } from './OrderResponsesModal'
import { EditApplicationModal } from './EditApplicationModal'
import { CompleteApplicationForm } from './CompleteApplicationForm'

import s from './MyApplicationsList.module.scss'

interface MyApplicationsListProps {
	onEdit?: (application: Application) => void
}

export const MyApplicationsList = ({ onEdit }: MyApplicationsListProps) => {
	const t = useTranslations('createApplications')
	const ta = useTranslations('applications')
	const [applications, setApplications] = useState<Application[]>([])
	const [loading, setLoading] = useState(true)
	const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
	const [modalOpen, setModalOpen] = useState(false)
	const [editingApplicationId, setEditingApplicationId] = useState<number | null>(null)
	const [showCompleteForm, setShowCompleteForm] = useState<number | null>(null)
	const [editFormData, setEditFormData] = useState({ description: '', tag_id: 0, region_id: 0 })
	const [completingApplication, setCompletingApplication] = useState(false)
	const [regions, setRegions] = useState<Region[]>([])
	const [tags, setTags] = useState<Tag[]>([])
	const [loadingOptions, setLoadingOptions] = useState(false)

	const fetchApplications = async () => {
		try {
			setLoading(true)
			const response = await clientApi.getApplications() as ApplicationsResponse
			setApplications(response.data || [])
		} catch (error) {
			console.error('Error fetching applications:', error)
			toast.error(t('errorFetching'))
		} finally {
			setLoading(false)
		}
	}

	const fetchEditOptions = async () => {
		try {
			setLoadingOptions(true)
			const [regionsResponse, tagsResponse] = await Promise.all([
				clientApi.getRegions(),
				clientApi.getTags()
			])
			
			// Обработка ответов в зависимости от структуры API
			const regionsData = (regionsResponse as any)?.data || regionsResponse || []
			const tagsData = (tagsResponse as any)?.data || tagsResponse || []
			
			setRegions(regionsData)
			setTags(tagsData)
		} catch (error) {
			console.error('Error fetching options:', error)
			toast.error('Ошибка загрузки данных для редактирования')
		} finally {
			setLoadingOptions(false)
		}
	}

	useEffect(() => {
		fetchApplications()
	}, [])

	const handleEdit = (application: Application) => {
		setEditingApplicationId(application.id)
		setEditFormData({
			description: application.description,
			tag_id: application.tag?.id || 0,
			region_id: application.region?.id || 0
		})
		
		// Загружаем опции для селектов если еще не загружены
		if (regions.length === 0 || tags.length === 0) {
			fetchEditOptions()
		}
	}

	const handleSaveEdit = async (applicationId: number) => {
		try {
			await clientApi.updateApplication(applicationId, editFormData)
			toast.success('Заявка успешно обновлена')
			fetchApplications()
			setEditingApplicationId(null)
		} catch (error) {
			console.error('Error updating application:', error)
			toast.error('Ошибка при обновлении заявки')
		}
	}

	const handleCancelEdit = () => {
		setEditingApplicationId(null)
		setEditFormData({ description: '', tag_id: 0, region_id: 0 })
	}

	const handleShowCompleteForm = (id: number) => {
		setShowCompleteForm(id)
	}

	const handleCompleteApplication = async (applicationId: number, reason: string) => {
		try {
			setCompletingApplication(true)
			await clientApi.completeApplication(applicationId, reason)
			toast.success('Заявка успешно завершена')
			fetchApplications()
			setShowCompleteForm(null)
		} catch (error) {
			console.error('Error completing application:', error)
			toast.error('Ошибка при завершении заявки')
		} finally {
			setCompletingApplication(false)
		}
	}

	const handleCancelComplete = () => {
		setShowCompleteForm(null)
	}

	const canEditOrDelete = (status: string) => {
		// Разрешаем редактирование и завершение для всех статусов
		return true
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'in_progress':
				return '#28a745'  // Зеленый
			case 'moderation':
				return '#ffc107'  // Желтый
			case 'assigned':
				return '#17a2b8'  // Голубой (информационный)
			case 'completed':
				return '#007bff'  // Синий
			case 'cancelled':
			case 'canceled':    // Поддерживаем оба варианта
				return '#dc3545'  // Красный
			default:
				return '#6c757d'  // Серый
		}
	}

	if (loading) {
		return <div className={s.loading}>{t('loading')}</div>
	}

	return (
		<div className={s.container}>
			{applications.length === 0 ? (
				<div className={s.empty}>
					<p>{t('noApplications')}</p>
				</div>
			) : (
				<div className={s.applicationsList}>
					{applications.map((app) => (
						<div key={app.id} className={s.applicationCard}>
							{showCompleteForm === app.id ? (
								<div className={s.completeFormContainer}>
									<CompleteApplicationForm
										applicationId={app.id}
										onComplete={handleCompleteApplication}
										onCancel={handleCancelComplete}
										isLoading={completingApplication}
									/>
								</div>
							) : editingApplicationId === app.id ? (
								<div className={s.editFormContainer}>
									<div className={s.editForm}>
										<h3 className={s.editTitle}>Редактирование заявки</h3>
										
										{loadingOptions && <div className={s.loadingOptions}>Загрузка данных...</div>}
										
										<div className={s.editField}>
											<label>Вид услуги:</label>
											<select
												className={s.editSelect}
												value={editFormData.tag_id}
												onChange={(e) => setEditFormData(prev => ({
													...prev,
													tag_id: parseInt(e.target.value)
												}))}
												disabled={loadingOptions}>
												<option value={0}>Выберите услугу</option>
												{tags.map(tag => (
													<option key={tag.id} value={tag.id}>
														{tag.name}
													</option>
												))}
											</select>
										</div>

										<div className={s.editField}>
											<label>Регион:</label>
											<select
												className={s.editSelect}
												value={editFormData.region_id}
												onChange={(e) => setEditFormData(prev => ({
													...prev,
													region_id: parseInt(e.target.value)
												}))}
												disabled={loadingOptions}>
												<option value={0} >Выберите регион</option>
												{regions.map(region => (
													<option key={region.id} value={region.id}>
														{region.name} {region.path && `(${region.path})`}
													</option>
												))}
											</select>
										</div>

										<div className={s.editField}>
											<label>Описание:</label>
											<textarea
												className={s.editTextarea}
												value={editFormData.description}
												onChange={(e) => setEditFormData(prev => ({
													...prev,
													description: e.target.value
												}))}
												rows={3}
												placeholder="Опишите вашу ситуацию подробно..."
											/>
										</div>
										
										<div className={s.editActions}>
											<Button
												variant="primary"
												size="sm"
												onClick={() => handleSaveEdit(app.id)}
												className={s.saveBtn}
												disabled={loadingOptions || !editFormData.description.trim() || editFormData.tag_id === 0 || editFormData.region_id === 0}>
												Сохранить
											</Button>
											<Button
												variant="secondary"
												size="sm"
												onClick={handleCancelEdit}
												className={s.cancelBtn}>
												Отмена
											</Button>
										</div>
									</div>
								</div>
							) : (
								<>
									<div className={s.cardHeader}>
										<div className={s.cardTop}>
											<h3 className={s.applicationTitle}>
												{app.tag?.name || t('service.other')}
											</h3>
											<div className={s.topRight}>
												{/* Счетчик откликов */}
												{(app.responses_count || 0) > 0 && (
													<div className={s.responsesCounter}>
														<span className={s.counterNumber}>{app.responses_count}</span>
													</div>
												)}
												
												<div className={s.statusBadge}>
													<span 
														className={s.statusDot} 
														style={{ backgroundColor: getStatusColor(app.status) }}
													/>
													<span className={s.statusText}>
														{t(`status.${app.status}`)}
													</span>
												</div>
											</div>
										</div>
										
                <div className={s.cardMeta}>
                    <div className={s.metaItem}>
                        <span className={s.metaLabel}>{t('region')}:</span>
                        <span className={s.metaValue}>
                            {app.region?.path
                                ? `${app.region.name} (${app.region.path})`
                                : app.region?.name || t('notSpecified')}
                        </span>
                    </div>
                    <div className={s.metaItem}>
                        <span className={s.metaLabel}>Язык обращения:</span>
                        <span className={s.metaValue}>
                            {app.appeal_language
                                ? (app.appeal_language === 'kz' ? 'Қазақша' : app.appeal_language === 'ru' ? 'Русский' : 'Қазақша/русский')
                                : ta('notSpecified')}
                        </span>
                    </div>
                    <div className={s.metaItem}>
                        <span className={s.metaLabel}>{t('form.descriptionLabel')}:</span>
                        <p className={s.description}>{app.description}</p>
                    </div>
											<div className={s.metaItem}>
												<span className={s.metaLabel}>{t('publishDate')}:</span>
												<span className={s.metaValue}>
													{new Date(app.created_at).toLocaleDateString('ru-RU', {
														day: '2-digit',
														month: '2-digit',
														year: 'numeric'
													})}
												</span>
											</div>
										</div>
									</div>

									{canEditOrDelete(app.status) && (
										<div className={s.cardActions}>
											<Button
												variant="primary"
												size="sm"
												onClick={() => handleEdit(app)}
												className={s.editBtn}>
												{ta('editButton')}
											</Button>
											<Button
												variant="danger"
												size="sm"
												onClick={() => handleShowCompleteForm(app.id)}
												className={s.completeBtn}>
												{ta('completeButton')}
											</Button>
										</div>
									)}
									
									{/* Кнопка для просмотра откликов, доступна всегда */}
									<div className={s.responsesSection}>
										<Button
											variant="secondary"
											size="sm"
											onClick={() => {
												setSelectedOrderId(app.id)
												setModalOpen(true)
											}}
											className={s.responsesBtn}>
											Посмотреть отклики
										</Button>
									</div>
								</>
							)}
						</div>
					))}
				</div>
			)}
			
			{/* Модальное окно откликов */}
			{selectedOrderId && (
				<OrderResponsesModal
					isOpen={modalOpen}
					onClose={() => {
						setModalOpen(false)
						setSelectedOrderId(null)
					}}
					orderId={selectedOrderId}
					orderTitle={applications.find(app => app.id === selectedOrderId)?.tag?.name || 'Заявка'}
					orderDate={applications.find(app => app.id === selectedOrderId)?.created_at || ''}
					orderStatus={applications.find(app => app.id === selectedOrderId)?.status || ''}
				/>
			)}
		</div>
	)
}
