'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'

import { Button } from '@/shared/ui-kit'
import { clientApi } from '@/shared/api/clientApi'

import s from './OrderResponsesModal.module.scss'

interface Lawyer {
	id: number
	name: string
	phone: string
	specializations: string[]
	experience_years: number
	rating: number
	reviews_count: number
}

interface OrderResponse {
	id: number
	status: string
	created_at: string
	lawyer: Lawyer
}

interface ApiResponse {
	success: boolean
	data: OrderResponse[]
}

interface OrderResponsesModalProps {
	isOpen: boolean
	onClose: () => void
	orderId: number
	orderTitle: string
	orderDate: string
	orderStatus: string
}

export const OrderResponsesModal = ({
	isOpen,
	onClose,
	orderId,
	orderTitle,
	orderDate,
	orderStatus
}: OrderResponsesModalProps) => {
	const t = useTranslations('applications')
	const [responses, setResponses] = useState<OrderResponse[]>([])
	const [loading, setLoading] = useState(false)
	const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null)

	useEffect(() => {
		if (isOpen && orderId) {
			fetchResponses()
		}
	}, [isOpen, orderId])

	const fetchResponses = async () => {
		try {
			setLoading(true)
			
			// Используем API из clientApi
			const data = await clientApi.getApplicationResponses(orderId) as ApiResponse
			setResponses(data.data || [])
		} catch (error) {
			console.error('Error fetching responses:', error)
			toast.error('Ошибка при загрузке откликов')
		} finally {
			setLoading(false)
		}
	}

	const handleAcceptLawyer = async (responseId: number) => {
		// Проверяем, можно ли принять отклик
		if (orderStatus !== 'in_progress') {
			toast.error('Заявка недоступна для назначения юриста. Статус: ' + orderStatus)
			return
		}

		try {
			await clientApi.acceptResponse({ id: responseId })
			toast.success('Юрист назначен')
			fetchResponses()
		} catch (error) {
			console.error('Error accepting lawyer:', error)
			toast.error('Ошибка при назначении юриста')
		}
	}

	const handleRejectLawyer = async (responseId: number) => {
		try {
			await clientApi.rejectResponse({ id: responseId })
			toast.success('Отклик отклонен')
			fetchResponses()
			// Обновляем список заявок, так как статус мог измениться
			window.location.reload() // Принудительное обновление для актуализации статусов
		} catch (error) {
			console.error('Error rejecting lawyer:', error)
			toast.error('Ошибка при отклонении отклика')
		}
	}

	if (!isOpen) return null

	return (
		<div className={s.overlay} onClick={onClose}>
			<div className={s.modal} onClick={(e) => e.stopPropagation()}>
				<div className={s.header}>
					<h2 className={s.title}>Узнайте, кто откликнулся на вашу заявку</h2>
					<button className={s.closeBtn} onClick={onClose}>×</button>
				</div>

				<div className={s.orderInfo}>
					<h3 className={s.orderTitle}>{orderTitle}</h3>
					<div className={s.orderMeta}>
						<span>Дата создания: {new Date(orderDate).toLocaleDateString('ru-RU')}</span>
						<span>Статус: {orderStatus}</span>
					</div>
				</div>

				<div className={s.content}>
					{loading ? (
						<div className={s.loading}>Загрузка откликов...</div>
					) : responses.length === 0 ? (
						<div className={s.empty}>
							<p>Пока никто не откликнулся на вашу заявку</p>
						</div>
					) : (
						<div className={s.responsesList}>
							{responses.map((response) => (
								<div key={response.id} className={s.responseCard}>
									<div className={s.lawyerInfo}>
										<div className={s.avatar}>
											{response.lawyer.name.charAt(0).toUpperCase()}
										</div>
										<div className={s.details}>
											<h4 className={s.lawyerName}>{response.lawyer.name}</h4>
											<p className={s.specializations}>
												{response.lawyer.specializations.join(', ') || 'Общая практика'}
											</p>
											<div className={s.meta}>
												<span>Опыт: {response.lawyer.experience_years} лет</span>
												{response.lawyer.rating > 0 && (
													<span>Рейтинг: {response.lawyer.rating} ({response.lawyer.reviews_count} отзывов)</span>
												)}
											</div>
										</div>
									</div>

									<div className={s.actions}>
										<Button
											variant="secondary"
											size="sm"
											onClick={() => setSelectedLawyer(response.lawyer)}
										>
											Посмотреть анкету
										</Button>
									</div>

									{response.status === 'accepted' && (
										<div className={s.acceptedBadge}>Назначен</div>
									)}
									{response.status === 'rejected' && (
										<div className={s.rejectedBadge}>Отклонён</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>

				{/* Модалка профиля юриста */}
				{selectedLawyer && (
					<div className={s.profileOverlay} onClick={() => setSelectedLawyer(null)}>
						<div className={s.profileModal} onClick={(e) => e.stopPropagation()}>
							<div className={s.profileHeader}>
								<h3>Анкета юриста</h3>
								<button onClick={() => setSelectedLawyer(null)}>×</button>
							</div>
							
							<div className={s.profileContent}>
								<div className={s.profileAvatar}>
									{selectedLawyer.name.charAt(0).toUpperCase()}
								</div>
								
								<h4>{selectedLawyer.name}</h4>
								<p>{selectedLawyer.specializations.join(', ')}</p>
								
								<div className={s.profileDetails}>
									<div className={s.profileRow}>
										<span>Телефон:</span>
										<span>{selectedLawyer.phone}</span>
									</div>
									<div className={s.profileRow}>
										<span>Опыт:</span>
										<span>{selectedLawyer.experience_years} лет</span>
									</div>
									{selectedLawyer.rating > 0 && (
										<div className={s.profileRow}>
											<span>Рейтинг:</span>
											<span>{selectedLawyer.rating} ({selectedLawyer.reviews_count} отзывов)</span>
										</div>
									)}
								</div>

								<div className={s.profileActions}>
									<Button
										variant="primary"
										onClick={() => {
											const response = responses.find(r => r.lawyer.id === selectedLawyer.id)
											if (response) {
												handleAcceptLawyer(response.id)
												setSelectedLawyer(null)
											}
										}}
									>
										Принять заявку
									</Button>
									<Button
										variant="secondary"
										onClick={() => {
											const response = responses.find(r => r.lawyer.id === selectedLawyer.id)
											if (response) {
												handleRejectLawyer(response.id)
												setSelectedLawyer(null)
											}
										}}
									>
										Отказать
									</Button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
