'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { Modal } from '@/shared/ui-kit/Modal'
import s from './MaintenanceModal.module.scss'

const MAINTENANCE_CONFIG = {
	// Дата технических работ (год, месяц (0-11), день)
	date: new Date(2026, 1, 7), // 7 февраля 2026
	startHour: 18, // 18:00
	endHour: 24, // 24:00
}

const isMaintenanceTime = (): boolean => {
	const now = new Date()
	const { date, startHour, endHour } = MAINTENANCE_CONFIG

	// Проверяем что сегодня нужная дата
	const isSameDay =
		now.getFullYear() === date.getFullYear() &&
		now.getMonth() === date.getMonth() &&
		now.getDate() === date.getDate()

	if (!isSameDay) return false

	// Проверяем время
	const currentHour = now.getHours()
	return currentHour >= startHour && currentHour < endHour
}

const translations = {
	ru: {
		title: 'Технические работы',
		message:
			'Уважаемые пользователи! На сайте проводятся технические работы. Некоторые функции могут быть временно недоступны.',
		timeInfo: 'Время проведения работ: с 18:00 до 24:00',
		apology: 'Приносим извинения за временные неудобства.',
		close: 'Понятно',
	},
	kz: {
		title: 'Техникалық жұмыстар',
		message:
			'Құрметті пайдаланушылар! Сайтта техникалық жұмыстар жүргізілуде. Кейбір функциялар уақытша қолжетімсіз болуы мүмкін.',
		timeInfo: 'Жұмыс уақыты: 18:00-ден 24:00-ге дейін',
		apology: 'Уақытша қолайсыздықтар үшін кешірім сұраймыз.',
		close: 'Түсінікті',
	},
}

export const MaintenanceModal = () => {
	const [isOpen, setIsOpen] = useState(false)
	const locale = useLocale() as 'ru' | 'kz'
	const t = translations[locale] || translations.ru

	useEffect(() => {
		// Проверяем время при загрузке
		if (isMaintenanceTime()) {
			// Проверяем, не закрывал ли пользователь модалку в этой сессии
			const dismissed = sessionStorage.getItem('maintenanceModalDismissed')
			if (!dismissed) {
				setIsOpen(true)
			}
		}
	}, [])

	const handleClose = () => {
		setIsOpen(false)
		// Запоминаем что пользователь закрыл модалку
		sessionStorage.setItem('maintenanceModalDismissed', 'true')
	}

	if (!isOpen) return null

	return (
		<Modal isOpen={isOpen} onClose={handleClose} closeButton>
			<div className={s.content}>
				<div className={s.iconWrapper}>
					<svg
						className={s.icon}
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</div>
				<h2 className={s.title}>{t.title}</h2>
				<p className={s.message}>{t.message}</p>
				<p className={s.timeInfo}>{t.timeInfo}</p>
				<p className={s.apology}>{t.apology}</p>
				<button className={s.closeButton} onClick={handleClose}>
					{t.close}
				</button>
			</div>
		</Modal>
	)
}
