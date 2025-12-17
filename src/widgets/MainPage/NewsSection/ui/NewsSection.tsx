'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { useState, useEffect, useCallback } from 'react'

import instagramIcon from '@/app/assets/icons/instagram.svg'
import { Modal, useModal } from '@/shared/ui-kit/Modal'
import { newsApi, NewsItem as ApiNewsItem } from '@/shared/api'

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
	const locale = useLocale()
	const [currentSlide, setCurrentSlide] = useState(0)
	const { isOpen, open, close } = useModal()
	const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)
	const [newsItems, setNewsItems] = useState<NewsItem[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const defaultInstagramLink = t('modal.instagramUrl')

	// Преобразование данных из API в формат компонента
	const mapApiNewsToLocal = useCallback((apiNews: ApiNewsItem): NewsItem => {
		const publishedDate = apiNews.published_at 
			? new Date(apiNews.published_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
			: ''
		
		// Обработка URL изображения
		let imageUrl = '/assets/images/news.png' // fallback изображение
		const rawImage = apiNews.image_url || apiNews.image
		if (rawImage) {
			// Проверяем что URL абсолютный
			if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
				imageUrl = rawImage
			} else if (rawImage.startsWith('/')) {
				// Относительный путь - добавляем домен API
				imageUrl = `https://api.zanger-app.kz${rawImage}`
			}
		}
		
		return {
			id: apiNews.slug,
			title: apiNews.title,
			description: apiNews.excerpt || '',
			date: publishedDate,
			image: imageUrl,
			readMore: t('readMore'),
			fullDescription: apiNews.content || apiNews.excerpt || '',
			eventDay: apiNews.title,
			instagramLink: defaultInstagramLink
		}
	}, [t, defaultInstagramLink])

	// Загрузка новостей из API
	useEffect(() => {
		const fetchNews = async () => {
			try {
				setIsLoading(true)
				const apiLocale = locale === 'kz' ? 'kk' : locale
				const response = await newsApi.getLatest({ locale: apiLocale, limit: 15 })
				
				if (response.success && response.data.length > 0) {
					const mappedNews = response.data.map(mapApiNewsToLocal)
					setNewsItems(mappedNews)
				} else {
					// Если API пустой - не показываем секцию
					setNewsItems([])
				}
			} catch (error) {
				console.warn('Не удалось загрузить новости из API:', error)
				// Если ошибка - не показываем секцию
				setNewsItems([])
			} finally {
				setIsLoading(false)
			}
		}

		fetchNews()
	}, [locale, mapApiNewsToLocal])

	const handleCloseModal = () => {
		close()
		setSelectedNews(null)
	}

	const openModal = (item: NewsItem) => {
		setSelectedNews(item)
		open()
	}

	const nextSlide = () => {
		if (newsItems.length === 0) return
		setCurrentSlide((prev) => (prev + 1) % newsItems.length)
	}

	const prevSlide = () => {
		if (newsItems.length === 0) return
		setCurrentSlide((prev) => (prev - 1 + newsItems.length) % newsItems.length)
	}

	const getVisibleItems = () => {
		if (newsItems.length === 0) return []
		const items = []
		for (let i = 0; i < Math.min(3, newsItems.length); i++) {
			const index = (currentSlide + i) % newsItems.length
			items.push(newsItems[index])
		}
		return items
	}

	// Показываем скелетон пока загружаются данные
	if (isLoading) {
		return (
			<section id="news" className={s.wrapper}>
				<div className={s.container}>
					<div className={s.titleLine}></div>
					<h2 className={s.title}>{t('title')}</h2>
					<div className={s.newsGrid}>
						{[1, 2, 3].map((i) => (
							<div key={i} className={s.newsCard} style={{ opacity: 0.5 }}>
								<div className={s.imageContainer} style={{ background: 'rgba(255,255,255,0.1)' }} />
								<div className={s.content}>
									<div className={s.textContent}>
										<div style={{ height: 24, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }} />
										<div style={{ height: 48, background: 'rgba(255,255,255,0.05)', borderRadius: 4, marginTop: 8 }} />
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
		)
	}

	// Не показываем секцию если нет новостей
	if (newsItems.length === 0) {
		return null
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

						{/* CTA for AI audiobot Zanger */}
						{selectedNews.id === 'ai-audiobot-zanger' && (
							<div className={s.modalFooter}>
								<Link href="tel:5510" className={s.instagramLink}>
									<span>Позвонить 5510</span>
								</Link>
							</div>
						)}

						<div className={s.modalFooter}>
							<span className={s.metaLabel}>{t('modal.instagramLabel')}</span>
							<Link
								href={selectedNews.instagramLink}
								target="_blank"
								rel="noopener noreferrer"
								className={s.instagramLink}
							>
								<Image src={instagramIcon} alt="instagram" width={32} height={32} />
								<span>{t('modal.instagramCta')}</span>
							</Link>
						</div>
					</div>
				)}
			</Modal>
		</section>
	)
}
