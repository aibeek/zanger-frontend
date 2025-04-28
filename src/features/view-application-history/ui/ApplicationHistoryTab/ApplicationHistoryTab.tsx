'use client'

import { DashboarEmptyHistory } from '@/widgets/DashboarEmptyHistory'

import s from './ApplicationHistoryTab.module.scss'
import { ApplicationHistoryList } from '../ApplicationHistoryList'
import { useApplicationHistoryStore } from '../../model/applicationHistoryStore'
import { useEffect } from 'react'

export const ApplicationHistoryTab = () => {
	const { applicationsHistory, loadingApplicationsHistory, fetchApplicationsHistory } = useApplicationHistoryStore()

	useEffect(() => {
		fetchApplicationsHistory()
	}, [])

	return (
		<>
			<ApplicationHistoryList />
			{/* {applications.length === 0 && (
				<DashboarEmptyHistory
					redirectUrl={'/ru/dashboard/main'}
					buttonContent={'Создать заявку'}
				/>
			)} */}
		</>
	)
}
