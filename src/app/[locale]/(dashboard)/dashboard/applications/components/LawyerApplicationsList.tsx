'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

import { Button } from '@/shared/ui-kit'
import { lawyerApi, sharedApi, Tag } from '@/shared/api'
import { SearchSelect, useRegions, useLoginStore } from '@/features/auth'
import { useRegionsUtils, truncateDescription } from '@/shared/lib'

import { Eye, Phone } from 'lucide-react'
import { DateComponent } from '@/shared/ui-kit/DateComponent'
import { ApplicationDetailsModal } from './ApplicationDetailsModal'

import s from './LawyerApplicationsList.module.scss'

interface LawyerApplication {
    id: number
    description: string
    short_description?: string
    status: string
    created_at: string
    deadline: string
    phone?: string
    appeal_language?: 'kz' | 'ru' | 'kz_ru'
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
	const [tags, setTags] = useState<Tag[]>([])
	const [loading, setLoading] = useState(true)
	const [filters, setFilters] = useState<Filters>({})
	const [page, setPage] = useState(1)
	const perPage = 10
	const [hasMore, setHasMore] = useState(true)
	const [isLoadingMore, setIsLoadingMore] = useState(false)
	const [selectedApp, setSelectedApp] = useState<LawyerApplication | null>(null)
	const [isResponding, setIsResponding] = useState(false)
	
	// Ref для sentinel элемента (точка срабатывания infinite scroll)
	const sentinelRef = useRef<HTMLDivElement>(null)
	// Ref для предотвращения дублирования запросов
	const isLoadingRef = useRef(false)

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
	
	// Функция для загрузки следующей страницы (используется IntersectionObserver)
	const loadMore = useCallback(() => {
		if (!hasMore || isLoadingRef.current || loading) return
		isLoadingRef.current = true
		fetchApplications(page + 1, true).finally(() => {
			isLoadingRef.current = false
		})
	}, [hasMore, page, loading])
	
	// IntersectionObserver для infinite scroll
	useEffect(() => {
		const sentinel = sentinelRef.current
		if (!sentinel) return
		
		const observer = new IntersectionObserver(
			(entries) => {
				const [entry] = entries
				if (entry.isIntersecting && hasMore && !isLoadingMore && !loading) {
					loadMore()
				}
			},
			{
				// Срабатываем когда sentinel приближается к viewport (200px от нижнего края)
				rootMargin: '0px 0px 200px 0px',
				threshold: 0
			}
		)
		
		observer.observe(sentinel)
		
		return () => {
			observer.disconnect()
		}
	}, [hasMore, isLoadingMore, loading, loadMore])

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
			router.push(`/${language}/dashboard/subscription`)
			return
		}

		try {
			setIsResponding(true)
			await lawyerApi.respondToOrder(applicationId)
			toast.success(t('responseSubmitted'))
			setSelectedApp(null)
			// Перезагружаем список заявок
			fetchApplications()
		} catch (error) {
			console.error('Error responding to application:', error)
			toast.error(t('responseError'))
		} finally {
			setIsResponding(false)
		}
	}

	if (loading) {
		return (
	 		<div className={s.loading}>
				<p>Загрузка заявок...</p>
			</div>
		)
	}

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
					{applications.map((app, index) => (
						<div key={`${app.id}-${index}`} className={s.applicationCard}>
							<div className={s.cardHeader}>
								<span className={s.clientName}>{app.user?.name || 'Клиент'}</span>
								{/* <div className={s.cardStats}>
									<div className={s.statItem}>
										<Eye size={16} />
										<span>{Math.floor(Math.random() * 50) + 1}</span>
									</div>
									<div className={s.statItem}>
										<Phone size={16} />
										<span>{Math.floor(Math.random() * 10)}</span>
									</div>
								</div> */}
							</div>
							
                            <div className={s.cardContent}>
                                <h3 className={s.applicationTitle}>
                                    {app.tag?.name || t('serviceType.other')}
                                </h3>
                                {app.short_description && (
                                    <p className={s.description}>{truncateDescription(app.short_description)}</p>
                                )}
								
                                <div className={s.cardMeta}>
                                    <div className={s.metaRow}>
                                        <strong>{t('region')}:</strong>
                                        <span>{app.region?.name || 'Не указан'}</span>
                                    </div>
                                    <div className={s.metaRow}>
                                        <strong>Язык обращения:</strong>
                                        <span>{app.appeal_language ? (app.appeal_language === 'kz' ? 'Қазақша' : app.appeal_language === 'ru' ? 'Русский' : 'Қазақша/русский') : 'Не указан'}</span>
                                    </div>
                                    <div className={`${s.metaRow} ${s.metaRowAction}`}>
                                        <div className={s.metaLeft}>
                                            <strong>{t('date')}:</strong>
                                            <span suppressHydrationWarning>
                                                <DateComponent date={app.created_at} />
                                            </span>
                                        </div>
                                        <button
                                            className={s.detailsBtn}
                                            onClick={() => setSelectedApp(app)}
                                        >
                                            {t('details') || 'Подробнее'}
                                        </button>
                                    </div>
                                </div>

                                
                            </div>
						</div>
					))}
				</div>
			)}

			{/* Sentinel элемент для infinite scroll */}
			<div ref={sentinelRef} className={s.sentinel}>
				{isLoadingMore && (
					<div className={s.loadingMore}>
						<div className={s.spinner}></div>
						<span>Загрузка...</span>
					</div>
				)}
			</div>

			{selectedApp && (
				<ApplicationDetailsModal
					application={selectedApp}
					onClose={() => setSelectedApp(null)}
					onRespond={handleRespond}
					isResponding={isResponding}
				/>
			)}
		</div>
	)
}
