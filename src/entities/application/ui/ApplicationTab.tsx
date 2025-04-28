import { CreateApplicationForm } from '@/features/create-application'

import s from './ApplicationTab.module.scss'

export const ApplicationTab = () => {
	return (
		<section className={s.wrapper}>
			<div className={s.inner}>
				<h4 className={s.title}>Создать заявку</h4>
				<CreateApplicationForm />
			</div>
		</section>
	)
}
