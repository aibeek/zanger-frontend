'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import s from './ResourcesSection.module.scss'

// Импорт иконок
import AituIcon from '@/app/assets/icons/resourses/aitu.svg'
import EgovIcon from '@/app/assets/icons/resourses/egov.svg'
import EotinishIcon from '@/app/assets/icons/resourses/eotinish.svg'
import AdiletgovIcon from '@/app/assets/icons/resourses/adiletgov.svg'
import ErdrIcon from '@/app/assets/icons/resourses/erdr.svg'
import LeIcon from '@/app/assets/icons/resourses/le.svg'
import SupremeCourtIcon from '@/app/assets/icons/resourses/верховный суд.svg'
import Contract24Icon from '@/app/assets/icons/resourses/договор24.svg'
import EnotaryIcon from '@/app/assets/icons/resourses/enotary.svg'
import AdiletkzIcon from '@/app/assets/icons/resourses/adiletkz.svg'

export const ResourcesSection = () => {
	const t = useTranslations('lending.resourcesSection')
	
	const resources = [
		{ id: 'aitu', icon: AituIcon },
		{ id: 'egov', icon: EgovIcon },
		{ id: 'eotinish', icon: EotinishIcon },
		{ id: 'adiletgov', icon: AdiletgovIcon },
		{ id: 'erdr', icon: ErdrIcon },
		{ id: 'le', icon: LeIcon },
		{ id: 'supreme-court', icon: SupremeCourtIcon },
		{ id: 'contract24', icon: Contract24Icon },
		{ id: 'adiletkz', icon: AdiletkzIcon },
		{ id: 'enotary', icon: EnotaryIcon }
	]

	return (
		<section className={s.wrapper}>
			<div className={s.container}>
				<h2 className={s.title}>{t('title')}</h2>
				
				<div className={s.resourcesGrid}>
					{resources.map((resource) => (
						<Image
							key={resource.id}
							src={resource.icon}
							alt={resource.id}
							width={320}
							height={80}
							className={s.resourceIcon}
						/>
					))}
				</div>
			</div>
		</section>
	)
}
