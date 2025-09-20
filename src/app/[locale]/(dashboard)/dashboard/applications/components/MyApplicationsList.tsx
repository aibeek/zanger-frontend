'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'

import { Button } from '@/shared/ui-kit'
import { clientApi, Application, ApplicationsResponse } from '@/shared/api'
import { CreateApplicationForm } from '@/features/create-application'

import s from './MyApplicationsList.module.scss'

interface MyApplicationsListProps {
	onEdit?: (application: Application) => void
}

export const MyApplicationsList = ({ onEdit }: MyApplicationsListProps) => {
	const t = useTranslations('createApplications')
	const [applications, setApplications] = useState<Application[]>([])
	const [loading, setLoading] = useState(true)

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

	useEffect(() => {
		fetchApplications()
	}, [])

	const handleDelete = async (id: number) => {
		if (!confirm(t('confirmDelete'))) return

		try {
			await clientApi.deleteApplication(id)
			toast.success(t('successDelete'))
			fetchApplications()
		} catch (error) {
			console.error('Error deleting application:', error)
			toast.error(t('errorDelete'))
		}
	}

	const canEditOrDelete = (status: string) => {
		return status === 'in_progress' || status === 'moderation'
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'in_progress':
				return '#28a745'
			case 'moderation':
				return '#ffc107'
			case 'completed':
				return '#007bff'
			case 'cancelled':
				return '#dc3545'
			default:
				return '#6c757d'
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
							<div className={s.cardHeader}>
								<div className={s.cardTop}>
									<h3 className={s.applicationTitle}>
										{app.tag?.name || t('service.other')}
									</h3>
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
										onClick={() => onEdit?.(app)}
										className={s.editBtn}>
										{t('edit')}
									</Button>
									<Button
										variant="danger"
										size="sm"
										onClick={() => handleDelete(app.id)}
										className={s.completeBtn}>
										{t('complete')}
									</Button>
								</div>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	)
}
