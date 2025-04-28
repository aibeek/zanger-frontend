import { ApplicationHistoryTab } from '@/features/my-applications-view/ui/MyApplicationsTab'

import s from './page.module.scss'

export default function RequestsView() {
	return (
		<div className={s.page}>
			<ApplicationHistoryTab />
		</div>
	)
}
