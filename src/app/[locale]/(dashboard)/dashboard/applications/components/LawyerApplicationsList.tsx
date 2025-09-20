'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'

import { Button } from '@/shared/ui-kit'
import { lawyerApi, sharedApi } from '@/shared/api'
import { SearchSelect, useRegions } from '@/features/auth'
import { useRegionsUtils } from '@/shared/lib'

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

interface Specialization {
	id: number
	name: string
}

interface Filters {
	region_id?: number
	specialization_id?: number
	date?: string
	[key: string]: string | number | undefined
}

export const LawyerApplicationsList = () => {
	const t = useTranslations('applications')
	const { regions } = useRegions()
	const { optionsForSelect, allOptions } = useRegionsUtils(regions, [])
	
	const [applications, setApplications] = useState<LawyerApplication[]>([])
	const [specializations, setSpecializations] = useState<Specialization[]>([])
	const [loading, setLoading] = useState(true)
	const [filters, setFilters] = useState<Filters>({})

	// Загружаем специализации
	useEffect(() => {
		const fetchSpecializations = async () => {
			try {
				const response = await sharedApi.getAllSpecializations() as { data: Specialization[] }
				setSpecializations(response.data || [])
			} catch (error) {
				console.error('Error fetching specializations:', error)
			}
		}
		fetchSpecializations()
	}, [])

	const fetchApplications = async () => {
		try {
			setLoading(true)
			// Передаем фильтры в API
			const response = await lawyerApi.getOrders(filters) as { data: LawyerApplication[] }
			setApplications(response.data || [])
		} catch (error) {
			console.error('Error fetching applications:', error)
			toast.error(t('errorFetching'))
		} finally {
			setLoading(false)
		}
	}

	// Загружаем заявки при изменении фильтров
	useEffect(() => {
		fetchApplications()
	}, [filters])

	// Обработчики фильтров
	const handleRegionChange = (region: any) => {
		setFilters(prev => ({
			...prev,
			region_id: region?.id || undefined
		}))
	}

	const handleSpecializationChange = (specialization: any) => {
		setFilters(prev => ({
			...prev,
			specialization_id: specialization?.id || undefined
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
		fetchApplications()
	}, [])

	const handleRespond = async (applicationId: number) => {
		try {
			// Здесь будет логика отклика на заявку
			console.log('Responding to application:', applicationId)
			toast.success(t('responseSubmitted'))
		} catch (error) {
			console.error('Error responding to application:', error)
			toast.error(t('responseError'))
		}
	}

	if (loading) {
		return <div className={s.loading}>{t('loading')}</div>
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
							data={specializations}
							value={specializations.find((s) => s.id === filters.specialization_id) || null}
							onChange={handleSpecializationChange}
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
						Очистить
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
					{applications.map((app) => (
						<div key={app.id} className={s.applicationCard}>
							<div className={s.cardHeader}>
								<h3 className={s.applicationTitle}>
									{app.tag?.name || t('serviceType.other')}
								</h3>
							</div>
							
							<div className={s.cardContent}>
								<p className={s.description}>{app.description}</p>
								
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
					))}
				</div>
			)}
		</div>
	)
}
