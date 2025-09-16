'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'
import s from './DescriptionSection.module.scss'
import { ContentDataItem, useAppContentData } from '@/shared/lib'

export const DescriptionSection = () => {
	const t = useTranslations('lending.descriptionSection')
	const { descriptionData } = useAppContentData()
	const sectionRef = useRef<HTMLElement>(null)

	const data: ContentDataItem = descriptionData[0]

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
		<section id="info" className={s.wrapper} ref={sectionRef}>
			<div className={s.backgroundDecoration}>
			</div>
			
			<div className={s.container}>
				<div className={s.titleLine}></div>
				<h2 className={s.sectionTitle}>{t('title')}</h2>
				
				<div className={s.cardGrid}>
					<div className={s.left}>
						<div className={s.cardInner}>
							<h2 className={s.title}>
								<span className={s.titleGradient}>{t('leftTitle')}</span>
							</h2>
							<ul className={s.leftList}>
								{data.left.text.map((text, idx) => (
									<li
										className={`${s.item} ${s.fadeInItem}`}
										key={idx}
										style={{ animationDelay: `${idx * 0.1}s` }}
										dangerouslySetInnerHTML={{ __html: text }}
									/>
								))}
							</ul>
							<div className={s.descrWrapper}>
								<p className={s.descr}>{t('leftDescr')}</p>
							</div>
						</div>
					</div>
					
					<div className={s.right}>
						<div className={s.cardInner}>
							<h2 className={s.title}>
								<span className={s.titleGradient}>{t('rightTitle')}</span>
							</h2>
							<ul className={s.rightList}>
								{data.right.text.map((text, idx) => (
									<li
										className={`${s.item} ${s.fadeInItem}`}
										key={idx}
										style={{ animationDelay: `${idx * 0.1 + 0.2}s` }}
										dangerouslySetInnerHTML={{ __html: text }}
									/>
								))}
							</ul>
							<div className={s.descrWrapper}>
								<p className={s.descr}>{t('rightDescr')}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
