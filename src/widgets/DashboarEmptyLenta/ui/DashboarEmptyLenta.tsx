'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'

import empty from '@/app/assets/icons/lenta-empty.webp'

import s from './DashboarEmptyLenta.module.scss'

export const DashboarEmptyLenta = () => {
	const t = useTranslations('lenta')

	return (
		<section className={s.wrapper}>
			<Image
				src={empty}
				alt={t('empty.alt')}
				width={311}
				height={311}
			/>
			<p className={s.descr}>{t('empty.text')}</p>
		</section>
	)
}
