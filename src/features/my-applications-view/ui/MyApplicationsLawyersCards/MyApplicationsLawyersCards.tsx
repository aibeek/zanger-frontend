'use client'

import s from './MyApplicationsLawyersCards.module.scss'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

import avatar from '@/app/assets/icons/header-avatar.svg'

import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useMyApplicationsStore } from '../../model'
import { Button } from '@/shared/ui-kit'
import { Application } from '@/shared/api'

interface MyApplicationsLawyersCardsProps {
	responses: Application['responses']
}

export const MyApplicationsLawyersCards = ({ responses }: MyApplicationsLawyersCardsProps) => {
	const t = useTranslations()
	const [openCard, setOpenCard] = useState<number | null>(null)

	const {
		filteredApplications,
		refetchApplications,
		acceptResponse,
		rejectResponse,
		getDetailedResponse,
		detailedResponse,
	} = useMyApplicationsStore()

	const toggleCard = async (responseId: number) => {
		if (openCard === responseId) {
			setOpenCard(null)
		} else {
			await getDetailedResponse(responseId)
			setOpenCard(responseId)
		}
	}

	const handleReject = async (responseId: number) => {
		await rejectResponse(responseId)
		setOpenCard(null)
		await refetchApplications()
	}

	const handleAccept = async (responseId: number) => {
		await acceptResponse(responseId)
		setOpenCard(null)
	}

	if (!responses || responses.length === 0) return null

	const renderResponseCard = (application: any, response: any, isOpen: boolean) => {
		const lawyer = response.lawyer

		return (
			<motion.article
				key={response.id}
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.95 }}
				transition={{ duration: 0.3 }}
				className={`${s.card} ${isOpen ? s.openCard : ''}`}>
				<div className={s.cardPreview}>
					<div className={`${s.left} ${isOpen ? s.leftOpen : ''}`}>
						<Image
							src={lawyer?.icon || avatar}
							alt="аватарка"
							width={40}
							height={40}
							className={s.avatar}
						/>

						<div className={s.userName}>
							<p className={s.name}>{lawyer?.name || 'Без имени'}</p>
							<p className={s.job}>{application.tag?.name || 'Без специализации'}</p>
						</div>
					</div>

					{!isOpen && (
						<div className={s.btns}>
							<Button
								style={{ fontSize: '14px' }}
								variant="border"
								size="md"
								className={s.toggleBtn}
								onClick={() => toggleCard(response.id)}>
								Посмотреть
							</Button>

							<Button
								style={{ fontSize: '14px' }}
								variant="primary"
								size="md"
								className={s.denyBtn}
								onClick={() => handleReject(response.id)}>
								Отклонить
							</Button>
						</div>
					)}
				</div>

				{isOpen && (
					<div>
						<div className={s.cardDetails}>
							<ul className={`${s.cardDetailsList} ${isOpen ? s.open : ''}`}>
								<li className={s.city}>
									Город: <span>{detailedResponse?.region || '—'}</span>
								</li>
								<li className={s.cost}>
									Стоимость консультации: <span>{detailedResponse?.consultation_price || 'не указано'}</span>
								</li>
								<li className={s.tag}>
									Специальность: <span>{detailedResponse?.specialization || 'не указано'}</span>
								</li>
								<li className={s.phone}>
									Номер телефона: <span>{detailedResponse?.phone ? detailedResponse.phone : 'Скрыт'}</span>
								</li>
								<li className={s.phone}>
									WhatsApp: <span>{detailedResponse?.whats_app ? detailedResponse.whats_app : 'Скрыт'}</span>
								</li>
							</ul>
						</div>

						<div className={s.cardDetaildBottom}>
							<div className={s.btns}>
								<Button
									variant="primary"
									className={s.agreeBtn}
									onClick={() => handleAccept(response.id)}>
									Принять
								</Button>
								<Button
									variant="danger"
									className={s.denyRedBtn}
									onClick={() => handleReject(response.id)}>
									Отказать
								</Button>
							</div>
							<Button
								variant="clear"
								size="auto"
								className={s.reportBtn}
								onClick={() => console.log('Пожаловаться')}>
								Пожаловаться на юриста
							</Button>
						</div>
					</div>
				)}
			</motion.article>
		)
	}

	return (
		<section className={s.cards}>
			<AnimatePresence mode="popLayout">
				{filteredApplications.map((application) => {
					const { responses } = application

					if (!responses || responses.length === 0) return null

					const isCardOpen = responses.some((r: any) => r.id === openCard)

					let responsesToRender: any[] = []

					if (isCardOpen) {
						responsesToRender = [
							...responses.filter((r: any) => r.id === openCard),
							...responses.filter((r: any) => (r.id !== openCard && !r.is_rejected) || r.is_accepted),
						]
					} else {
						responsesToRender = responses.filter((r: any) => !r.is_rejected || r.is_accepted)
					}

					return (
						<div
							className={s.cards}
							key={application.id}>
							<AnimatePresence mode="popLayout">
								{responsesToRender.map((response: any) => {
									const isOpen = response.id === openCard
									return renderResponseCard(application, response, isOpen)
								})}
							</AnimatePresence>
						</div>
					)
				})}
			</AnimatePresence>
		</section>
	)
}
