
'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef, useMemo } from 'react'
import s from './TeamSection.module.scss'

interface TeamMember {
	id: number
	name: string
	position: string
	experience: string
	description: string
	image: string
}

export const TeamSection = () => {
	const t = useTranslations('lending.teamSection')
	const sectionRef = useRef<HTMLElement>(null)

	// Данные о членах команды
	const teamMembers: TeamMember[] = [
		{
			id: 1,
			name: 'КЕНЖЕБАЕВ БАҚЫТЖАН',
			position: 'Юрисконсульт',
			experience: 'более 9 лет',
			description: 'корпоративное право, гражданское право, претензионно-исковая работа и дp',
			image: '/assets/images/kb.jpg'
		},
		{
		id: 2,
			name: 'МУКАНОВА НАЗЫМ',
			position: 'Медиатор, Юрисконсульт',
			experience: 'более 2 лет',
			description: 'Медиатор в области уголовных, гражданских, семейных, трудовых споров',
			image: '/assets/images/mn.jpg'
		},
		{
		id: 3,
			name: 'Рахматулина Светлана Анатольевна',
			position: 'Медиатор, Юрисконсульт, Арбитр',
			experience: 'более 20 лет',
			description: 'гражданское, уголовное, семейное, трудовое, наследственное право',
			image: '/assets/images/rsa.jpg'
		},
		{
		id: 4,
			name: 'Мусабеков Меирбек Дильдаханович',
			position: 'Адвокат, Юрисконсульт',
			experience: 'более 20 лет',
			description: 'Военные дела, гражданское право, ДТП, жилищные, наследственные споры.',
			image: '/assets/images/mma.jpg'
		},
	]

	// Создаем дублированный массив для бесконечной анимации
	const duplicatedTeamMembers = useMemo(() => {
		return [...teamMembers, ...teamMembers]
	}, [teamMembers])

	// Анимация появления
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add(s.animated)
					}
				})
			},
			{ threshold: 0.1 }
		)

		if (sectionRef.current) {
			observer.observe(sectionRef.current)
		}

		return () => observer.disconnect()
	}, [])

	return (
		<section className={s.wrapper} ref={sectionRef}>
			<div className={s.container}>
				<h2 className={s.title}>{t('title')}</h2>
				
				<div className={s.teamGrid}>
					{duplicatedTeamMembers.map((member, index) => (
						<div key={`member-${member.id}-${index}`} className={s.memberCard}>
							<img
								src={member.image}
								alt={member.name}
								className={s.memberImage}
							/>
							<div className={s.memberOverlay}>
								<h3 className={s.memberName}>{member.name}</h3>
								<p className={s.memberPosition}>{member.position}</p>
								<p className={s.memberExperience}>{member.experience}</p>
								<p className={s.memberDescription}>{member.description}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}

