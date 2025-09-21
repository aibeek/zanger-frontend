'use client'

import { useRef, useState } from 'react'
import { useInfiniteScroll } from '@/shared/lib'
import { DateComponent } from '@/shared/ui-kit/DateComponent'
import { Button, ListLoader } from '@/shared/ui-kit'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'
import { clientApi } from '@/shared/api'

import s from './MyApplicationsList.module.scss'
import { CompleteApplicationForm } from '../CompleteApplicationForm'

export const MyApplicationsList = ({ items, loadMore, isLoadingMore, isReachingEnd, mutate }) => {
	const [showCompleteForm, setShowCompleteForm] = useState(false)
	const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null)
	const [isCancellingApplication, setIsCancellingApplication] = useState(false)

	const t = useTranslations('myApplications')
	const loadMoreRef = useRef(null)
	useInfiniteScroll({ loadMore, isLoadingMore, isReachingEnd, loadMoreRef })

	const canEditOrDelete = (status: string) => {
		// Разрешаем редактирование и завершение для всех статусов
		return true
	}

	const handleEdit = (app: any) => {
		// Логика для редактирования заявки
		console.log('Edit application:', app)
	}

	const handleShowCompleteForm = (id: number) => {
		setSelectedApplicationId(id)
		setShowCompleteForm(true)
	}

	const handleCompleteApplication = async (applicationId: number, reason: string) => {
		try {
			setIsCancellingApplication(true)
			await clientApi.completeApplication(applicationId, reason)
			toast.success(t('applicationCompleted'))
			mutate()
		} catch (error) {
			console.error('Error completing application:', error)
			toast.error(t('errorCompletingApplication'))
		} finally {
			setIsCancellingApplication(false)
			setShowCompleteForm(false)
			setSelectedApplicationId(null)
		}
	}

	const handleCancelComplete = () => {
		setShowCompleteForm(false)
		setSelectedApplicationId(null)
	}

	if (showCompleteForm && selectedApplicationId) {
		return (
			<CompleteApplicationForm
				applicationId={selectedApplicationId}
				onComplete={handleCompleteApplication}
				onCancel={handleCancelComplete}
				isLoading={isCancellingApplication}
			/>
		)
	}

	return (
		<div className={s.wrapper}>
			<div className={s.inner}>
				<div className={s.items}>
					{items.map((item) => (
						<article className={s.item} key={item.id}>
							<div className={s.top}>
								<div className={s.title}>{item.title}</div>
								<div className={s.description}>{item.description}</div>
								<div className={s.dataRow}>
									<span className={s.deadline}>{t('deadline')}: {item.deadline}</span>
									<span className={s.publishDate}>{t('publishDate')}: <DateComponent date={item.created_at} /></span>
								</div>
								<div className={s.regionRow}>
									<span className={s.region}>
										{t('region')}: {item.region?.name || 'Не указано'}
									</span>
								</div>
								<div className={s.statusRow}>
									<span className={s.status}>Статус: {t(`status.${item.status}`)}</span>
								</div>
							</div>
							<div className={s.buttonsRow}>
								<Button 
									className={s.editBtn} 
									variant="primary" 
									size="full"
									onClick={() => handleEdit(item)}
									disabled={!canEditOrDelete(item.status)}>
									{t('editButton')}
								</Button>
								<Button 
									className={s.completeBtn} 
									variant="danger" 
									size="full" 
									onClick={() => handleShowCompleteForm(item.id)}
									disabled={!canEditOrDelete(item.status)}>
									{t('completeButton')}
								</Button>
							</div>
						</article>
					))}

					<ListLoader
						ref={loadMoreRef}
						isLoadingMore={isLoadingMore}
					/>
				</div>
			</div>
		</div>
	)
}
