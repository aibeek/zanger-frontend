import { HistoryTab } from '@/features/history-view'

import s from './page.module.scss'

export default function HistoryView() {
	return (
		<div className={s.page}>
			<HistoryTab />
		</div>
	)
}
