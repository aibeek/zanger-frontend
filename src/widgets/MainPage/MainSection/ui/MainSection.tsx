'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Header } from '@/widgets/Header'
import MainBgDesk from '@/app/assets/images/main-bg-desk.webp'
import MainBgMobile from '@/app/assets/images/main-bg-mobile.webp'

import s from './MainSection.module.scss'
import { useMediaQuery } from '@/shared/lib'
import { PhoneIcon } from '@heroicons/react/20/solid'

export const MainSection = () => {
	const t = useTranslations('lending.mainSection')
	const isMobile = useMediaQuery('(max-width: 768px)')

	return (
		<section className={s.wrapper}>
			<div className={s.decor}>
				<div className="container-middle">
					<Header variant="lending-variant" />
					<div className={s.inner}>
						<div className={s.topContent}>
							<h1
								className={s.title}
								dangerouslySetInnerHTML={{ __html: t('title') }}
							/>
							<p className="lending-descr">{t('description')}</p>
						</div>
						<div className={s.phoneNumber}>
				<div className={s.top}>
					<PhoneIcon color={'rgba(2, 125, 255, 1)'} width={16} hanging={16} />
					<span>1515</span>
				</div>
				<div className={s.bottom}>
					<p>с номеров всех операторов</p>
				</div>
			</div>
						<div className={s.bg}>
							{isMobile ? (
								<Image
									src={MainBgMobile}
									alt="изображение телефонов"
									priority
								/>
							) : (
								<Image
									src={MainBgDesk}
									alt="изображение телефонов"
									priority
								/>
							)}
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
