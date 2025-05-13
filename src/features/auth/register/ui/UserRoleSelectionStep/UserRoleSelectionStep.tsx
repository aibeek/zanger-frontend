'use client'

import Image from 'next/image'
import { Button } from '@/shared/ui-kit'
import client from '@/app/assets/images/role-client.webp'
import lawyer from '@/app/assets/images/role-lawyer.webp'
import { Link } from '@/i18n'
import { useTranslations } from 'next-intl'

import s from './UserRoleSelectionStep.module.scss'

export const UserRoleSelectionStep = () => {
	const t = useTranslations('auth.roleSelection')

	const cardData = [
		{
			role: 'client',
			className: 'clientCard',
			title: t('client.title'),
			descr: t('client.description'),
			imgSrc: client,
		},
		{
			role: 'lawyer',
			className: 'lawyerCard',
			title: t('lawyer.title'),
			descr: t('lawyer.description'),
			imgSrc: lawyer,
		},
	]

	return (
		<div className={s.wrapper}>
			<div className={s.cards}>
				{cardData.map(({ role, className, title, descr, imgSrc }) => (
					<article
						key={role}
						className={s[className]}>
						<div className={s.inner}>
							<div className={s.left}>
								<h2 className={s.title}>{title}</h2>
								<p className={s.descr}>{descr}</p>
								<Link href={`/auth/register/${role}`}>
									<Button
										className={s.btn}
										variant="border"
										size="auto">
										{t('choose')}
									</Button>
								</Link>
							</div>
							<div className={s.right}>
								<Image
									src={imgSrc}
									alt={role}
									width={150}
									height={210}
								/>
							</div>
						</div>
					</article>
				))}
			</div>
		</div>
	)
}
