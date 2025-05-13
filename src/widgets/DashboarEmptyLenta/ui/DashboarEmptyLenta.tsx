'use client'

import Image from 'next/image'

import empty from '@/app/assets/icons/lenta-empty.webp'

import s from './DashboarEmptyLenta.module.scss'

export const DashboarEmptyLenta = () => {
	return (
		<section className={s.wrapper}>
			<Image
				src={empty}
				alt={'иконка'}
				width={311}
				height={311}
			/>
			<p className={s.descr}>Мы ищем для вас заказы!</p>
		</section>
	)
}
