import s from './page.module.scss'
import { ApplicationTab } from '@/features/create-application'

export default function MainView() {
	return (
		<div className={s.page}>
			<ApplicationTab />
		</div>
	)
}
