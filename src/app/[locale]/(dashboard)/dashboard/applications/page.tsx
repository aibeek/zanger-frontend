import s from './page.module.scss'
import { MyApplicationsTab } from '@/features/my-applications-view'

export default function RequestsView() {
	return (
		<div className={s.page}>
			<MyApplicationsTab />
		</div>
	)
}
