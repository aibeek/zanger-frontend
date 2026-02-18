'use client'

import { useTranslations } from 'next-intl'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import s from './DescriptionSection.module.scss'
import { ContentDataItem, useAppContentData } from '@/shared/lib'

export const DescriptionSection = () => {
	const t = useTranslations('lending.descriptionSection')
	const { descriptionData } = useAppContentData()
	const sectionRef = useRef<HTMLElement>(null)
	const [openCard, setOpenCard] = useState<'left' | 'right' | null>(null)

	const data: ContentDataItem = descriptionData[0]

	const toggleCard = (card: 'left' | 'right') => {
		setOpenCard(prev => prev === card ? null : card)
	}

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
			<div className={s.container}>
				<h2 className={s.sectionTitle}>{t('title')}</h2>

				<div className={s.contentLayout}>
					{/* Клиентам */}
					<div className={`${s.accordionCard} ${openCard === 'left' ? s.accordionCardOpen : ''}`}>
						<button
							className={s.accordionHeader}
							onClick={() => toggleCard('left')}
							type="button"
						>
							<span className={s.accordionTitle}>{t('leftTitle')}</span>
							<span className={s.accordionArrow}>
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
									<path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
								</svg>
							</span>
						</button>
						<div className={s.accordionBody}>
							<ul className={s.list}>
								{data.left.text.map((text, idx) => (
									<li
										key={idx}
										className={s.item}
										dangerouslySetInnerHTML={{ __html: text }}
									/>
								))}
							</ul>
							<p className={s.footnote}>{t('leftDescr')}</p>
						</div>
					</div>

					{/*  */}
					<div className={`${s.accordionCard} ${openCard === 'right' ? s.accordionCardOpen : ''}`}>
						<button
							className={s.accordionHeader}
							onClick={() => toggleCard('right')}
							type="button"
						>
							<span className={s.accordionTitle}>{t('rightTitle')}</span>
							<span className={s.accordionArrow}>
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
									<path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
								</svg>
							</span>
						</button>
						<div className={s.accordionBody}>
							<ul className={s.list}>
								{data.right.text.map((text, idx) => (
									<li
										key={idx}
										className={s.item}
										dangerouslySetInnerHTML={{ __html: text }}
									/>
								))}
							</ul>
							<p className={s.footnote}>{t('rightDescr')}</p>
						</div>
					</div>

					<div className={s.illustrationWrap}>
						<Image
							src="/assets/sectionimg/women.png"
							alt=""
							width={400}
							height={500}
							className={s.illustration}
						/>
					</div>
				</div>
			</div>
		</section>
	)
}
