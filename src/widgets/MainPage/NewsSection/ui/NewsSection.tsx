'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import s from './NewsSection.module.scss'

interface NewsItem {
	id: string
	title: string
	description: string
	date: string
	image: string
	readMore: string
}

export const NewsSection = () => {
	const t = useTranslations('lending.newsSection')
	const [currentSlide, setCurrentSlide] = useState(0)
	
	const newsItems: NewsItem[] = [
		{
			id: 'new-laws',
			title: t('newLaws.title'),
			description: t('newLaws.description'),
			date: '03.08.2025',
			image: '/assets/images/news-1.jpg',
			readMore: t('readMore')
		},
		{
			id: 'legal-statistics',
			title: t('legalStatistics.title'),
			description: t('legalStatistics.description'),
			date: '05.06.2025',
			image: '/assets/images/news-2.jpg',
			readMore: t('readMore')
		},
		{
			id: 'lawyer-tips',
			title: t('lawyerTips.title'),
			description: t('lawyerTips.description'),
			date: '26.11.2025',
			image: '/assets/images/news-3.jpg',
			readMore: t('readMore')
		}
	]

	const nextSlide = () => {
		setCurrentSlide((prev) => (prev + 1) % newsItems.length)
	}

	const prevSlide = () => {
		setCurrentSlide((prev) => (prev - 1 + newsItems.length) % newsItems.length)
	}

	const getVisibleItems = () => {
		const items = []
		for (let i = 0; i < 3; i++) {
			const index = (currentSlide + i) % newsItems.length
			items.push(newsItems[index])
		}
		return items
	}

	return (
		<section id="news" className={s.wrapper}>
			<div className={s.container}>
				<h2 className={s.title}>{t('title')}</h2>
				
				<div className={s.newsGrid}>
					{getVisibleItems().map((item, index) => (
						<article key={`${item.id}-${currentSlide}-${index}`} className={s.newsCard}>
							<div className={s.imageContainer}>
								<Image
									src={item.image}
									alt={item.title}
									fill
									className={s.newsImage}
									style={{ objectFit: 'cover' }}
								/>
							</div>
							<div className={s.content}>
								<h3 className={s.newsTitle}>{item.title}</h3>
								<p className={s.newsDescription}>{item.description}</p>
								<div className={s.footer}>
									<span className={s.date}>{item.date}</span>
									<button className={s.readMoreBtn}>{item.readMore}</button>
								</div>
							</div>
						</article>
					))}
				</div>

				<div className={s.navigation}>
					<button className={s.navBtn} onClick={prevSlide} aria-label="Previous">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
							<path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
						</svg>
					</button>
					<button className={s.navBtn} onClick={nextSlide} aria-label="Next">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
							<path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
						</svg>
					</button>
				</div>
			</div>
		</section>
	)
}