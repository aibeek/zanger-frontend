'use client'

import { useTranslations } from 'next-intl'
import { Header } from '@/widgets/Header'

import s from './MainSection.module.scss'

export const MainSection = () => {
	const t = useTranslations('lending.mainSection')

	return (
		<section className={s.wrapper}>
			<div className={s.decor}>
				<div className="container-middle">
					<Header variant="lending-variant" />
					<div className={s.inner}>
						<h1
							className={s.title}
							dangerouslySetInnerHTML={{ __html: t('title') }}
						/>
						<p className="lending-descr">{t('description')}</p>
					</div>
				</div>
			</div>
		</section>
	)
}
