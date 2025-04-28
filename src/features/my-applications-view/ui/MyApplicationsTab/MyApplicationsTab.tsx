'use client'
import { useEffect } from 'react'

import s from './ApplicationHistoryTab.module.scss'
import { useMyApplicationsStore } from '../../model'
import { EmptyApplicationsAndResponses } from '@/widgets/EmptyApplicationsAndResponses'
import { MyApplicationsList } from '../MyApplicationsList'

export const ApplicationHistoryTab = () => {
	const { myApplications, loadingMyApplications, fetchMyApplications } = useMyApplicationsStore()

	useEffect(() => {
		fetchMyApplications()
	}, [])

	return (
		<>
			{myApplications.length === 0 ? (
				<EmptyApplicationsAndResponses
					redirectUrl={'/ru/dashboard/main'}
					buttonContent={'Создать заявку'}
				/>
			) : (
				<MyApplicationsList />
			)}
		</>
	)
}
