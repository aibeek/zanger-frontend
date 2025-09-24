'use client'


import Image from 'next/image'
import { Button } from '@/shared/ui-kit'
import { Link } from '@/i18n'
import { useTranslations } from 'next-intl'

import s from './UserRoleSelectionStep.module.scss'


	export const UserRoleSelectionStep = () => {
		const t = useTranslations('auth.roleSelection')

		const cardData = [
			{
				role: 'lawyer',
				className: 'lawyerCard',
				title: t('lawyer.title'),
				descr: t('lawyer.description'),
				icon: '/assets/images/Vector.svg',
			},
			{
				role: 'client',
				className: 'clientCard',
				title: t('client.title'),
				descr: t('client.description'),
				icon: '/assets/images/chel.svg',
			},
		]

			return (
				<div className={s.wrapper}>
					<h1 className={s.statusTitle}>Ваш статус</h1>
					<div className={s.header}>
						<Image src="/logo-blue.svg" alt="Zanger logo" width={48} height={56} />
						<span className={s.brand}>ZANGER</span>
					</div>
					<div className={s.cards}>
						{cardData.map(({ role, className, title, descr, icon }) => (
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
									<div className={s.iconWrap}>
										<Image src={icon} alt="role icon" width={120} height={120} />
									</div>
								</div>
							</article>
						))}
					</div>
				</div>
			)
	}
// ...existing code...
