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
		{ id: 'aitu', icon: AituIcon, url: 'https://aitu.io/' },
		{ id: 'egov', icon: EgovIcon, url: 'https://egov.kz/cms/kk' },
		{ id: 'eotinish', icon: EotinishIcon, url: 'https://eotinish.kz/kk' },
		{ id: 'adiletgov', icon: AdiletgovIcon, url: 'https://aisoip.adilet.gov.kz/debtors' },
		{ id: 'erdr', icon: ErdrIcon, url: 'https://erdr-public.kgp.kz/' },
		{ id: 'le', icon: LeIcon, url: 'https://legalexpert.kz/login' },
		{ id: 'supreme-court', icon: SupremeCourtIcon, url: 'https://sud.gov.kz/kaz' },
		{ id: 'contract24', icon: Contract24Icon, url: 'https://lawyer.dogovor24.kz/login' },
		{ id: 'adiletkz', icon: AdiletkzIcon, url: 'https://adilet.zan.kz/kaz' },
		{ id: 'enotary', icon: EnotaryIcon, url: 'https://enis.kz/?lang=kk' }
	]

	return (
		<section id="resources" className={s.wrapper}>
			<div className={s.container}>
				<h2 className={s.title}>{t('title')}</h2>
				
				<div className={s.resourcesGrid}>
					{resources.map((resource) => (
						resource.url ? (
							<a
								key={resource.id}
								href={resource.url}
								target="_blank"
								rel="noopener noreferrer"
								className={s.resourceLink}
							>
								<Image
									src={resource.icon}
									alt={resource.id}
									width={360}
									height={140}
									className={s.resourceIcon}
								/>
							</a>
						) : (
							<Image
								key={resource.id}
								src={resource.icon}
								alt={resource.id}
								width={360}
								height={140}
								className={s.resourceIcon}
							/>
						)
					))}
				</div>
			</div>
		</section>
	)
}
