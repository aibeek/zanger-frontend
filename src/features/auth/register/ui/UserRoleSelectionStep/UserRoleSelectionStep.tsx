'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { Button } from '@/shared'
import client from '@/app/assets/images/role-client.webp'
import lawyer from '@/app/assets/images/role-lawyer.webp'

import s from './UserRoleSelectionStep.module.scss'

const cardData = [
	{
		role: 'client',
		className: 'clientCard',
		title: 'Я - клиент',
		descr: 'Мне необходимо воспользоваться услугами специалистов в области права',
		imgSrc: client,
	},
	{
		role: 'lawyer',
		className: 'lawyerCard',
		title: 'Я - юрист',
		descr: 'Я готов оказать содействие в разрешении юридических вопросов и обеспечить их оперативное урегулирование',
		imgSrc: lawyer,
	},
]

export const UserRoleSelectionStep = () => {
	const router = useRouter()

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
								<Button
									className={s.btn}
									variant="border"
									onClick={() => router.push(`/ru/auth/register/${role}`)}
									size="auto">
									Выбрать
								</Button>
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
