import { MyResponsesTab } from '@/features/my-responses-view'

import s from './page.module.scss'

export default function ResponsesView() {
	return (
		<div className={s.page}>
			<MyResponsesTab />
		</div>
	)
}
