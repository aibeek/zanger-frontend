'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'

import { Button } from '@/shared/ui-kit'
import { clientApi, Application, ApplicationsResponse } from '@/shared/api'
import { CreateApplicationForm } from '../CreateApplicationForm'

import s from './ApplicationsManager.module.scss'

export const ApplicationsManager = () => {
	const t = useTranslations('createApplications')
	const [applications, setApplications] = useState<Application[]>([])
	const [editingId, setEditingId] = useState<number | null>(null)
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

	const handleEdit = (id: number) => {
		setEditingId(id)
	}

	const handleCancelEdit = () => {
		setEditingId(null)
	}

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

	if (loading) {
		return <div className={s.loading}>{t('loading')}</div>
	}

	return (
		<div className={s.wrapper}>
			<div className={s.header}>
				<h2>{t('myApplications')}</h2>
				<Button
					variant="primary"
					onClick={() => setEditingId(0)}
					className={s.createBtn}>
					{t('createNew')}
				</Button>
			</div>

			{editingId !== null && (
				<div className={s.formModal}>
					<div className={s.formOverlay}>
						<div className={s.formContainer}>
							<div className={s.formHeader}>
								<h3>{editingId === 0 ? t('createApplication') : t('editApplication')}</h3>
								<Button
									variant="secondary"
									onClick={handleCancelEdit}
									className={s.closeBtn}>
									×
								</Button>
							</div>
							<CreateApplicationForm
								applicationId={editingId === 0 ? undefined : editingId}
								onSuccess={() => {
									handleCancelEdit()
									fetchApplications()
								}}
							/>
						</div>
					</div>
				</div>
			)}

			<div className={s.applicationsList}>
				{applications.length === 0 ? (
					<div className={s.empty}>
						<p>{t('noApplications')}</p>
						<Button
							variant="primary"
							onClick={() => setEditingId(0)}>
							{t('createFirst')}
						</Button>
					</div>
				) : (
					applications.map((app) => (
						<div key={app.id} className={s.applicationCard}>
							<div className={s.cardHeader}>
								<div className={s.cardInfo}>
									<span className={s.status}>{t(`status.${app.status}`)}</span>
									<span className={s.date}>
										{new Date(app.created_at).toLocaleDateString()}
									</span>
								</div>
								{canEditOrDelete(app.status) && (
									<div className={s.cardActions}>
										<Button
											variant="secondary"
											size="sm"
											onClick={() => handleEdit(app.id)}>
											{t('edit')}
										</Button>
										<Button
											variant="danger"
											size="sm"
											onClick={() => handleDelete(app.id)}>
											{t('delete')}
										</Button>
									</div>
								)}
							</div>

							<div className={s.cardContent}>
								<div className={s.region}>
									<strong>{t('region')}:</strong>{' '}
									{app.region?.path
										? `${app.region.name} (${app.region.path})`
										: app.region?.name || t('notSpecified')}
								</div>
								{app.tag && (
									<div className={s.tag}>
										<strong>{t('service.label')}:</strong> {app.tag.name}
									</div>
								)}
								<div className={s.description}>
									<strong>{t('description')}:</strong>
									<p>{app.description}</p>
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	)
}
