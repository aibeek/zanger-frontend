'use client'

import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { ClientApplicationsView, LawyerApplicationsView } from './components'
import { RightWidgets } from '../components/RightWidgets'
import { Loader } from '@/shared/ui-kit'
import s from './page.module.scss'

export default function ApplicationsPage() {
	const [role, setRole] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const userRole = Cookies.get('role')
		setRole(userRole || null)
		setIsLoading(false)
	}, [])

	if (isLoading) {
		return (
			<div className={s.page}>
				<Loader />
			</div>
		)
	}

	return (
		<div className={s.page}>
			<div className={s.content}>
				{role === 'client' && <ClientApplicationsView />}
				{role === 'lawyer' && <LawyerApplicationsView />}
			</div>
			<RightWidgets />
		</div>
	)
}
