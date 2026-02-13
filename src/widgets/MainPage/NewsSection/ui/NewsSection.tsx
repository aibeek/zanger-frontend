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

	// Показываем скелетон пока загружаются данные
	if (isLoading) {
		return (
			<section id="news" className={s.wrapper}>
				<div className={s.container}>
					<div className={s.header}>
						<h2 className={s.title}>{t('title')}</h2>
					</div>
					<div className={s.contentWrapper}>
						<div className={s.leftColumn}>
							{[1, 2, 3].map((i) => (
								<div key={i} className={s.skeletonItem} />
							))}
						</div>
						<div className={s.rightColumn}>
							<div className={s.skeletonCard} />
						</div>
					</div>
				</div>
			</section>
		)
	}

	// Не показываем секцию если нет новостей
	if (newsItems.length === 0) {
		return null
	}

	// Разделяем новости на список (слева) и главную (справа)
	// Берем последние 4 новости.
	// 1-я пойдет в большую карточку (справа), 2,3,4 - в список (слева).
	// Или наоборот? На скриншоте слева список, справа карточка.
	// Обычно самое свежее - большое. Если 0-й элемент самый свежий, то он должен быть справа.
	const featuredNews = newsItems[0]
	const listNews = newsItems.slice(1, 4)

	return (
		<section id="news" className={s.wrapper}>
			<div className={s.container}>
				<div className={s.header}>
					<h2 className={s.title}>{t('title')}</h2>
					<Link href="/news" className={s.seeAllLink}>
						Смотреть все новости
					</Link>
				</div>

				<div className={s.contentWrapper}>
					{/* Левая колонка - Список новостей */}
					<div className={s.leftColumn}>
						{listNews.map((item) => (
							<div 
								key={item.id} 
								className={s.newsListItem}
								onClick={() => openModal(item)}
							>
								<div className={s.itemContent}>
									<h3 className={s.itemTitle}>{item.title}</h3>
									<p className={s.itemDate}>{item.description}</p>
								</div>
								<div className={s.arrowIcon}>
									<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M7 17L17 7M17 7H7M17 7V17" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
									</svg>
								</div>
							</div>
						))}
					</div>

					{/* Правая колонка - Большая карточка */}
					{featuredNews && (
						<div 
							className={s.rightColumn}
							onClick={() => openModal(featuredNews)}
						>
							<div className={s.featuredCard}>
								<Image
									src={featuredNews.image}
									alt={featuredNews.title}
									fill
									className={s.featuredImage}
								/>
								<div className={s.overlay} />
								<div className={s.featuredContent}>
									<h3 className={s.featuredTitle}>{featuredNews.title}</h3>
									<p className={s.featuredDescription}>{featuredNews.description}</p>
								</div>
								<div className={s.featuredArrow}>
									<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M7 17L17 7M17 7H7M17 7V17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
									</svg>
								</div>
							</div>
						</div>
					)}
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
