'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

import { Button } from '@/shared/ui-kit'
import { lawyerApi, sharedApi, Tag } from '@/shared/api'
import { SearchSelect, useRegions, useLoginStore } from '@/features/auth'
import { useRegionsUtils, truncateDescription } from '@/shared/lib'

import s from './LawyerApplicationsList.module.scss'

interface LawyerApplication {
	id: number
	description: string
	status: string
	created_at: string
	deadline: string
	tag?: {
		id: number
		name: string
	}
	region?: {
		id: number
		name: string
		path?: string
	}
	user?: {
		id: number
		name: string
	}
}

interface Filters {
	region_id?: number
	tag_id?: number  // Изменено с specialization_id на tag_id
	date?: string
	[key: string]: string | number | undefined
}

export const LawyerApplicationsList = () => {
	console.log('🔥 LawyerApplicationsList COMPONENT MOUNTED!')
	
	const t = useTranslations('applications')
	const tNotifications = useTranslations('notifications')
	const router = useRouter()
	const language = Cookies.get('language') || 'ru'
	const { regions } = useRegions()
	const { optionsForSelect, allOptions } = useRegionsUtils(regions, [])
	const { personalData } = useLoginStore()
	
		const [applications, setApplications] = useState<LawyerApplication[]>([])
		const [tags, setTags] = useState<Tag[]>([])  // Изменено с specializations на tags
		const [loading, setLoading] = useState(true)
		const [filters, setFilters] = useState<Filters>({})
		// Параметры пагинации
		const [page, setPage] = useState(1)
		const perPage = 10
		const [hasMore, setHasMore] = useState(true)
		const [isLoadingMore, setIsLoadingMore] = useState(false)

	// Проверяем наличие подписки у юриста
	const hasSubscription = personalData && 'lawyer' in personalData && personalData.lawyer?.subscription
	
	console.log('🔥 INITIAL STATE:', {
		hasSubscription,
		personalDataExists: !!personalData,
		lawyerData: personalData && 'lawyer' in personalData ? personalData.lawyer : null
	})

	// Отладочная информация при монтировании компонента
	useEffect(() => {
		console.log('LawyerApplicationsList mounted')
		console.log('User role from cookie:', document.cookie)
	}, [])

	// Загружаем теги (вместо специализаций)
	useEffect(() => {
		const fetchTags = async () => {
			try {
				console.log('Fetching tags...')
				const response = await sharedApi.getAllTags() as { data: Tag[] }
				console.log('Tags response:', response)
				setTags(response.data || [])
			} catch (error) {
				console.error('Error fetching tags:', error)
			}
		}
		fetchTags()
	}, [])

		const fetchApplications = async (pageToLoad: number = 1, append = false) => {
		try {
				if (append) setIsLoadingMore(true)
				else setLoading(true)
				console.log('Fetching applications with filters:', { ...filters, page: pageToLoad, per_page: perPage })
			
			// Передаем фильтры в API
				const response = await lawyerApi.getOrders({ ...filters, page: pageToLoad, per_page: perPage })
			console.log('API Response:', response)
			
			// Проверяем структуру ответа
			if (response && typeof response === 'object') {
				const data =
					'data' in response
						? (response as { data: any }).data
						: response
				console.log('Applications data:', data)
				
					let list: LawyerApplication[] = []
					if (Array.isArray(data)) {
						list = data
					} else if (data && Array.isArray((data as any).data)) {
						list = (data as any).data
				} else {
					console.warn('Unexpected response structure:', response)
						list = []
				}

					if (append) {
						setApplications(prev => [...prev, ...list])
					} else {
						setApplications(list)
					}

					// если пришло меньше, чем perPage — следующей страницы нет
					setHasMore(list.length === perPage)
					setPage(pageToLoad)
			} else {
				console.warn('Invalid response:', response)
					if (!append) setApplications([])
					setHasMore(false)
			}
		} catch (error) {
			console.error('Error fetching applications:', error)
			toast.error(t('errorFetching'))
				if (!append) setApplications([])
		} finally {
				setLoading(false)
				setIsLoadingMore(false)
		}
	}

	// Загружаем заявки при изменении фильтров
		useEffect(() => {
			// При изменении фильтров сбрасываем страницу на 1 и перезагружаем
			fetchApplications(1, false)
		}, [filters.region_id, filters.tag_id, filters.date])

	// Обработчики фильтров
	const handleRegionChange = (region: any) => {
		setFilters(prev => ({
			...prev,
			region_id: region?.id || undefined
		}))
	}

	const handleTagChange = (tag: any) => {
		setFilters(prev => ({
			...prev,
			tag_id: tag?.id || undefined
		}))
	}

	const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFilters(prev => ({
			...prev,
			date: event.target.value || undefined
		}))
	}

	const clearFilters = () => {
		setFilters({})
	}

		useEffect(() => {
			fetchApplications(1, false)
		}, [])

	const handleRespond = async (applicationId: number) => {
		// Проверяем наличие подписки перед откликом
		if (!hasSubscription) {
			toast.error(t('needSubscription') || 'Необходимо оформить подписку для отклика на заявки', {
				duration: 4000,
			})
			// Перенаправляем на страницу подписки
			router.push(`/${language}/dashboard/subscription`)
			return
		}

		try {
			await lawyerApi.respondToOrder(applicationId)
			toast.success(t('responseSubmitted'))
			// Перезагружаем список заявок
			fetchApplications()
		} catch (error) {
			console.error('Error responding to application:', error)
			toast.error(t('responseError'))
		}
	}

	if (loading) {
		return (
	 		<div className={s.loading}>
				<p>Загрузка заявок...</p>
			</div>
		)
	}

	console.log('LawyerApplicationsList render:', {
		applicationsCount: applications.length,
		applications: applications.slice(0, 2), // первые 2 для отладки
		loading,
		filters
	})

	return (
		<div className={s.container}>
			<div className={s.header}>
				<div className={s.filters}>
					<div className={s.filterItem}>
						<SearchSelect
							className="search-select dashboard-select"
							data={optionsForSelect}
							searchData={allOptions}
							value={allOptions.find((r) => r.id === filters.region_id) || null}
							onChange={handleRegionChange}
							getId={(item) => item.id}
							getLabel={(item) => (item.path ? `${item.name} (${item.path})` : item.name)}
							renderGroupLabel={(label) => <span>{label.slice(3)}</span>}
							placeholder={t('selectRegion')}
						/>
					</div>
					
					<div className={s.filterItem}>
						<SearchSelect
							className="search-select dashboard-select"
							data={tags}
							value={tags.find((t) => t.id === filters.tag_id) || null}
							onChange={handleTagChange}
							getId={(item) => item.id}
							getLabel={(item) => item.name}
							placeholder={t('serviceType')}
						/>
					</div>
					
					<div className={s.filterItem}>
						<input
							type="date"
							className={s.dateInput}
							value={filters.date || ''}
							onChange={handleDateChange}
							placeholder={t('selectDate')}
						/>
					</div>
					
					<Button 
						variant="secondary" 
						className={s.clearBtn}
						onClick={clearFilters}
					>
						{tNotifications('buttons.clear')}
					</Button>
					
					<Button variant="primary" className={s.searchBtn}>
						{t('searchButton')}
					</Button>
				</div>
			</div>

			{applications.length === 0 ? (
				<div className={s.empty}>
					<p>{t('noNewApplications')}</p>
				</div>
			) : (
				<div className={s.applicationsList}>
					{applications.map((app, index) => {
						// Если нет подписки - обрезаем описание
						const displayDescription = hasSubscription 
							? app.description 
							: truncateDescription(app.description, 2)
						
						return (
							<div key={`${app.id}-${index}`} className={s.applicationCard}>
								<div className={s.cardHeader}>
									<h3 className={s.applicationTitle}>
										{app.tag?.name || t('serviceType.other')}
									</h3>
								</div>
								
								<div className={s.cardContent}>
									<div className={hasSubscription ? s.description : s.descriptionTruncated}>
										<p>{displayDescription}</p>
										{!hasSubscription && (
											<div className={s.subscriptionOverlay}>
												<p className={s.subscriptionHint}>
													{t('subscriptionRequiredToViewFull') || 'Оформите подписку, чтобы видеть полное описание'}
												</p>
											</div>
										)}
									</div>
									
									<div className={s.cardMeta}>
										<div className={s.metaRow}>
											<div className={s.metaItem}>
												<span className={s.metaLabel}>{t('deadline')}:</span>
												<span className={s.metaValue}>
													{app.deadline || '3 дня'}
												</span>
											</div>
											<div className={s.metaItem}>
												<span className={s.metaLabel}>{t('clientType')}:</span>
												<span className={s.metaValue}>
													{app.user?.name || 'Физическое лицо'}
												</span>
											</div>
										</div>
										<div className={s.metaRow}>
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
								</div>

								<div className={s.cardActions}>
									<Button
										variant="primary"
										onClick={() => handleRespond(app.id)}
										className={s.respondBtn}>
										{t('respondButton')}
									</Button>
								</div>
							</div>
						)
					})}

								{hasMore && (
									<div className={s.loadMoreWrap}>
										<Button
											variant="secondary"
											disabled={isLoadingMore}
											onClick={() => fetchApplications(page + 1, true)}
										>
											{isLoadingMore ? 'Загрузка…' : 'Показать ещё'}
										</Button>
									</div>
								)}
				</div>
			)}
		</div>
	)
}
