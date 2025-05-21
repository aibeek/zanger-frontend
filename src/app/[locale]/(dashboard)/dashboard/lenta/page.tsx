import { LentaTab } from '@/features/lenta-view'

import s from './page.module.scss'

export default function LentaView() {
	return (
		<div className={s.page}>
			<LentaTab />
		</div>
	)
}
