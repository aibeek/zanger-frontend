import { Header } from '@/widgets/Header'

import s from './MainSection.module.scss'

export const MainSection = () => {
	return (
		<section className={s.wrapper}>
			<div className={s.decor}>
				<div className="container-middle">
					<Header variant={'lending-variant'} />
					<div className={s.inner}>
						<h1 className={s.title}>
							Платформа для поиска юристов
							<br /> и заказчиков
						</h1>
						<p className="lending-descr">Консультация эксперта по внешним вопросам.</p>
					</div>
				</div>
			</div>
		</section>
	)
}
