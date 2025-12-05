'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'

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

	// After 18:00 pilot mode: AI audiobot Zanger accepts applications at 5510
	const [isAfterSix, setIsAfterSix] = useState(false)
	useEffect(() => {
		const check = () => setIsAfterSix(new Date().getHours() >= 18)
		check()
		const id = setInterval(check, 60_000)
		return () => clearInterval(id)
	}, [])

	const newsItems: NewsItem[] = [
		{
			id: 'advokat-meeting',
			title: t('advokatMeeting.title'),
			description: t('advokatMeeting.description'),
			date: '05.12.2025',
			image: '/assets/images/advokat.jpeg',
			readMore: t('readMore'),
			fullDescription: t('advokatMeeting.fullDescription'),
			eventDay: t('advokatMeeting.eventDay'),
			instagramLink: defaultInstagramLink
		},
		{
			id: 'ecp-module-launch',
			title: 'Электронное подписание документов',
			description: 'На платформе ZANGER запущен модуль электронного подписания документов с использованием ЭЦП',
			date: '02.12.2025',
			image: '/assets/images/ecpnews.jpeg',
			readMore: t('readMore'),
			fullDescription: 'Электронное подписание документов\n\nНа платформе ZANGER запущен модуль электронного подписания документов с использованием ЭЦП\n\nМы запустили новый функцирнал — электронное подписание документов с использованием ЭЦП и подтверждением подлинности через Национальный удостоверяющий центр Республики Казахстан (НУЦ РК).\nТеперь юристы и клиенты могут подписывать юридически значимые документы онлайн, без личных встреч и бумажной волокиты.\n\nЧто дает новый модуль:\n\n•  Подписание документов ЭЦП сторон в личном кабинете платформы.\n•  Поддержка многосторонних документов — один договор могут подписать несколько участников, каждый со своей ЭЦП.\n•  Проверка подлинности подписи через НУЦ РК — система автоматически обращается к сервисам Национального удостоверяющего центра и подтверждает валидность сертификатов всех подписантов.\n•  Юридически значимый электронный документооборот — подписанные файлы имеют юридическую силу и сохраняются в профилях сторон\n•  Безопасность и конфиденциальность — передача и хранение документов осуществляется с соблюдением требований информационной безопасности.\n\nПодключайтесь, тестируйте и подписывайте документы онлайн — до конца года это бесплатно для всех!\n\nПресс-служба платформы ZANGER',
			eventDay: 'Запуск ЭЦП на платформе',
			instagramLink: defaultInstagramLink
		},
		{
			id: 'narxoz-clinic',
			title: t('narxozClinic.title'),
			description: t('narxozClinic.description'),
			date: '28.11.2025',
			image: '/assets/images/narkoz.jpeg',
			readMore: t('readMore'),
			fullDescription: t('narxozClinic.fullDescription'),
			eventDay: t('narxozClinic.eventDay'),
			instagramLink: defaultInstagramLink
		},
		{
			id: 'shanyraq-forum',
			title: 'Участие в форуме "Shanyraq 2025"',
			description: 'Команда Zanger приняла участие в ежегодном бизнес-форуме SHANYRAQ 2025',
			date: '10.11.2025',
			image: '/assets/images/shanyraq.jpeg',
			readMore: t('readMore'),
			fullDescription:
				'Команда Zanger приняла участие в ежегодном бизнес-форуме SHANYRAQ 2025, который прошёл 8 ноября 2025 года в г. Алматы. На площадке форума наши специалисты представили инновационные решения и обменялись опытом с ведущими предпринимателями Казахстана. Мы провели серию продуктивных встреч, обсудили актуальные тенденции развития бизнеса и рассматривали возможности будущего сотрудничества с участниками форума. Будем рады внедрять полученные идеи в работу, укреплять позиции компании Zanger на рынке и открывать новые направления для роста.',
			eventDay: 'Бизнес-форум SHANYRAQ 2025',
			instagramLink: defaultInstagramLink
		},
		{
			id: 'ai-audiobot-zanger',
			title: 'ИИ аудиобот Zanger',
			description: 'Аудиобот принимает заявки на казахском и русском языках в нерабочее время по номеру 5510',
			date: '08.11.2025', // фиксированная дата вместо динамической
			image: '/assets/images/botai.jpeg',
			readMore: t('readMore'),
			fullDescription:
				'Аудиобот принимает заявки на казахском и русском языках в нерабочее время по номеру 5510',
			eventDay: 'Аудиобот работает в нерабочее время',
			instagramLink: defaultInstagramLink
		},
		{
			id: 'legal-newspaper-interview',
			title: t('pressInterview.title'),
			description: t('pressInterview.description'),
			date: '04.11.2025',
			image: '/assets/images/gaxet.jpeg',
			readMore: t('readMore'),
			fullDescription: t('pressInterview.fullDescription'),
			eventDay: t('pressInterview.eventDay'),
			instagramLink: defaultInstagramLink
		},
		{
			id: 'whatsapp-bot',
			title: t('whatsappBot.title'),
			description: t('whatsappBot.description'),
			date: '03.11.2025',
			image: '/assets/images/bot.png',
			readMore: t('readMore'),
			fullDescription: t('whatsappBot.fullDescription'),
			eventDay: t('whatsappBot.eventDay'),
			instagramLink: defaultInstagramLink
		},
		{
			id: 'video-presentation',
			title: t('videoPresentation.title'),
			description: t('videoPresentation.description'),
			date: '01.11.2025',
			image: '/assets/images/newsvideo.png',
			readMore: t('readMore'),
			fullDescription: t('videoPresentation.fullDescription'),
			eventDay: t('videoPresentation.eventDay'),
			instagramLink: defaultInstagramLink
		},
		{
			id: 'e-sign-module',
			title: t('eSignModule.title'),
			description: t('eSignModule.description'),
			date: '28.10.2025',
			image: '/assets/images/newsesp.jpg',
			readMore: t('readMore'),
			fullDescription: t('eSignModule.fullDescription'),
			eventDay: t('eSignModule.eventDay'),
			instagramLink: defaultInstagramLink
		},
		{
			id: 'mobile-app-update',
			title: t('mobileAppUpdate.title'),
			description: t('mobileAppUpdate.description'),
			date: '26.10.2025',
			image: '/assets/images/newssss.png',
			readMore: t('readMore'),
			fullDescription: t('mobileAppUpdate.fullDescription'),
			eventDay: t('mobileAppUpdate.eventDay'),
			instagramLink: defaultInstagramLink
		},
		{
			id: 'live-applications',
			title: t('liveApplications.title'),
			description: t('liveApplications.description'),
			date: '21.10.2025',
			image: '/assets/images/news.png',
			readMore: t('readMore'),
			fullDescription: t('liveApplications.fullDescription'),
			eventDay: t('liveApplications.eventDay'),
			instagramLink: defaultInstagramLink
		},
		{
			id: 'new-laws',
			title: t('newLaws.title'),
			description: t('newLaws.description'),
			date: '20.10.2025',
			image: '/assets/images/hub.jpg',
			readMore: t('readMore'),
			fullDescription: t('newLaws.fullDescription'),
			eventDay: t('newLaws.eventDay'),
			instagramLink: defaultInstagramLink
		},
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
