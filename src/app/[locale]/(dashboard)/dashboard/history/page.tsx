'use client'

import { ApplicationHistoryTab } from '@/features/view-application-history/ui/ApplicationHistoryTab'
import s from './page.module.scss'

export default function HistoryView() {
	return (
		<div className={s.page}>
			<ApplicationHistoryTab />
		</div>
	)
}
