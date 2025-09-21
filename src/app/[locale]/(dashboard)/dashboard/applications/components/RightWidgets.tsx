'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

import { Button } from '@/shared/ui-kit'
import { clientApi, lawyerApi, Application, ApplicationsResponse, CancelApplicationType } from '@/shared/api'
import { EditApplicationModal } from './EditApplicationModal'

import s from './RightWidgets.module.scss'

export const RightWidgets = () => {
	const t = useTranslations('createApplications')
	const [applications, setApplications] = useState<Application[]>([])
	const [loading, setLoading] = useState(true)
	const [editingApplication, setEditingApplication] = useState<Application | null>(null)
	const [showEditModal, setShowEditModal] = useState(false)
	const role = Cookies.get('role')

	const fetchApplications = async () => {
		try {
			setLoading(true)
			let response: ApplicationsResponse
			
			if (role === 'client') {
				response = await clientApi.getApplications() as ApplicationsResponse
			} else if (role === 'lawyer') {
				response = await lawyerApi.getOrders() as ApplicationsResponse
			} else {
				return
			}
			
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
	}, [role])

	const handleEdit = (application: Application) => {
		setEditingApplication(application)
		setShowEditModal(true)
	}

	const handleCancel = async (applicationId: number) => {
		if (!confirm(t('confirmCancel'))) return

		try {
			if (role === 'client') {
				await clientApi.cancelApplication({
					application_id: applicationId,
					cancel_reason: 'Cancelled by user'
				})
				toast.success(t('successCancel'))
				fetchApplications()
			}
		} catch (error) {
			console.error('Error cancelling application:', error)
			toast.error(t('errorCancel'))
		}
	}

	const handleDelete = async (applicationId: number) => {
		if (!confirm(t('confirmDelete'))) return

		try {
			await clientApi.deleteApplication(applicationId)
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

	const handleModalClose = () => {
		setShowEditModal(false)
		setEditingApplication(null)
	}

	const handleEditSuccess = () => {
		fetchApplications()
		handleModalClose()
	}

	if (loading) {
		return (
			<div className={s.loading}>
				{t('loading')}
			</div>
		)
	}

	return (
		<div className={s.container}>
			<h2 className={s.title}>{t('myApplications')}</h2>
			
			<div className={s.applicationsList}>
				{applications.length === 0 ? (
					<div className={s.empty}>
						<p>{t('noApplications')}</p>
					</div>
				) : (
					applications.map((app) => (
						<div key={app.id} className={s.applicationCard}>
							<div className={s.cardHeader}>
								<div className={s.cardInfo}>
									<span className={s.status} data-status={app.status}>
										{t(`status.${app.status}`)}
									</span>
									<span className={s.date}>
										{new Date(app.created_at).toLocaleDateString()}
									</span>
								</div>
								
								{role === 'client' && canEditOrDelete(app.status) && (
									<div className={s.cardActions}>
										<Button
											variant="secondary"
											size="sm"
											onClick={() => handleEdit(app)}>
											{t('edit')}
										</Button>
										<Button
											variant="danger"
											size="sm"
											onClick={() => handleDelete(app.id)}>
											{t('delete')}
										</Button>
										<Button
											variant="secondary"
											size="sm"
											onClick={() => handleCancel(app.id)}>
											{t('cancel')}
										</Button>
									</div>
								)}
							</div>

							<div className={s.cardContent}>
								{app.tag && (
									<div className={s.cardField}>
										<strong>{t('serviceType')}:</strong> {app.tag.name}
									</div>
								)}
								
								<div className={s.cardField}>
									<strong>{t('region')}:</strong>{' '}
									{app.region?.path
										? `${app.region.name} (${app.region.path})`
										: app.region?.name || t('notSpecified')}
								</div>
								
								<div className={s.cardField}>
									<strong>{t('description')}:</strong>
									<p className={s.description}>{app.description}</p>
								</div>
								
								<div className={s.cardField}>
									<strong>{t('publishDate')}:</strong>{' '}
									{new Date(app.created_at).toLocaleDateString()}
								</div>
							</div>
						</div>
					))
				)}
			</div>

			<EditApplicationModal
				application={editingApplication}
				isOpen={showEditModal}
				onClose={handleModalClose}
				onSuccess={handleEditSuccess}
			/>
		</div>
	)
}
