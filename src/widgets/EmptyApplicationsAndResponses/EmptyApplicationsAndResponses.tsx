'use client'

import Image from 'next/image'

import { Button } from '@/shared'
import empty from '@/app/assets/icons/empty-applications-responses.webp'

import { redirect } from 'next/navigation'

import s from './EmptyApplicationsAndResponses.module.scss'

type Props = {
	buttonContent: string
	redirectUrl: string
}

export const EmptyApplicationsAndResponses = ({ buttonContent, redirectUrl }: Props) => {
	return (
		<section className={s.wrapper}>
			<Image
				src={empty}
				alt={'иконка'}
				width={311}
				height={311}
			/>
			<p className={s.descr}>Заявок пока нет</p>
			<Button
				onClick={() => redirect(redirectUrl)}
				variant={'primary'}
				size={'lg'}>
				{buttonContent}
			</Button>
		</section>
	)
}
