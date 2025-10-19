'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import instagramIcon from '@/app/assets/icons/instagram.svg'
import { Modal, useModal } from '@/shared/ui-kit/Modal'

import s from './NewsSection.module.scss'

interface NewsItem {
	id: string
	title: string
	description: string
	date: string
	image: string
	readMore: string
	fullDescription: string
	eventDay: string
	instagramLink: string
}

export const NewsSection = () => {
	const t = useTranslations('lending.newsSection')
	const [currentSlide, setCurrentSlide] = useState(0)
	const { isOpen, open, close } = useModal()
	const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)
	const defaultInstagramLink = t('modal.instagramUrl')

	const newsItems: NewsItem[] = [
		{
			id: 'digital-bridge',
			title: t('digitalBridge.title'),
			description: t('digitalBridge.description'),
			date: '17.10.2025',
			image: '/assets/images/dgital.jpeg',
			readMore: t('readMore'),
			fullDescription: t('digitalBridge.fullDescription'),
			eventDay: t('digitalBridge.eventDay'),
			instagramLink: t('digitalBridge.instagramUrl')
		},
		{
			id: 'new-laws',
			title: t('newLaws.title'),
			description: t('newLaws.description'),
			date: '03.08.2025',
			image: '/assets/images/news-1.png',
			readMore: t('readMore'),
			fullDescription: t('newLaws.fullDescription'),
			eventDay: t('newLaws.eventDay'),
			instagramLink: defaultInstagramLink
		},
		{
			id: 'legal-statistics',
			title: t('legalStatistics.title'),
			description: t('legalStatistics.description'),
			date: '05.06.2025',
			image: '/assets/images/news-2.png',
			readMore: t('readMore'),
			fullDescription: t('legalStatistics.fullDescription'),
			eventDay: t('legalStatistics.eventDay'),
			instagramLink: defaultInstagramLink
		},
		{
			id: 'lawyer-tips',
			title: t('lawyerTips.title'),
			description: t('lawyerTips.description'),
			date: '26.11.2025',
			image: '/assets/images/news-3.png',
			readMore: t('readMore'),
			fullDescription: t('lawyerTips.fullDescription'),
			eventDay: t('lawyerTips.eventDay'),
			instagramLink: defaultInstagramLink
		}
	]

	const handleCloseModal = () => {
		close()
		setSelectedNews(null)
	}

	const openModal = (item: NewsItem) => {
		setSelectedNews(item)
		open()
	}

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
				<div className={s.titleLine}></div>
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
								/>
							</div>
							<div className={s.content}>
								<div className={s.textContent}>
									<h3 className={s.newsTitle}>{item.title}</h3>
									<p className={s.newsDescription}>{item.description}</p>
								</div>
								<div className={s.footer}>
									<span className={s.date}>{item.date}</span>
									<button
										type="button"
										className={s.readMoreBtn}
										onClick={() => openModal(item)}
									>
										{item.readMore}
									</button>
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
			<Modal
				isOpen={isOpen}
				onClose={handleCloseModal}
				title={selectedNews?.title}
				className={s.newsModal}
				closeButton
			>
				{selectedNews && (
					<div className={s.modalContent}>
						<div className={s.modalMeta}>
							<div className={s.metaRow}>
								<span className={s.metaLabel}>{t('modal.dateLabel')}</span>
								<span className={s.metaValue}>{selectedNews.date}</span>
							</div>
							<div className={s.metaRow}>
								<span className={s.metaLabel}>{t('modal.dayLabel')}</span>
								<span className={s.metaValue}>{selectedNews.eventDay}</span>
							</div>
						</div>
						<p className={s.modalDescription}>{selectedNews.fullDescription}</p>
						<div className={s.modalFooter}>
							<span className={s.metaLabel}>{t('modal.instagramLabel')}</span>
							<Link
								href={selectedNews.instagramLink}
								target="_blank"
								rel="noopener noreferrer"
								className={s.instagramLink}
							>
								<Image
									src={instagramIcon}
									alt="instagram"
									width={32}
									height={32}
								/>
								<span>{t('modal.instagramCta')}</span>
							</Link>
						</div>
					</div>
				)}
			</Modal>
		</section>
	)
}