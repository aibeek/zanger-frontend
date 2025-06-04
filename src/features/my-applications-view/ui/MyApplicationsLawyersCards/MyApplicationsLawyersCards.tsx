'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'

import { Button } from '@/shared/ui-kit'
import { Application } from '@/shared/api'
import { ReportButton } from '@/features/report'
import avatar from '@/app/assets/icons/header-avatar.svg'
import whatsapp from '@/app/assets/icons/whatsapp.svg'
import telegram from '@/app/assets/icons/telegram-square.svg'

import { useMyApplicationsStore } from '../../model'
import s from './MyApplicationsLawyersCards.module.scss'
import { AppLink } from '@/shared/ui-kit/AppLink'
import { getTelegramLink } from '@/shared/lib'

interface MyApplicationsLawyersCardsProps {
	data: Application
	mutate: () => Promise<void>
}

export const MyApplicationsLawyersCards = ({ data, mutate }: MyApplicationsLawyersCardsProps) => {
	const t = useTranslations()
	const [openCard, setOpenCard] = useState<number | null>(null)

	const { acceptResponse, rejectResponse, getDetailedResponse, detailedResponse } = useMyApplicationsStore()

	const toggleCard = async (responseId: number) => {
		if (openCard === responseId) {
			setOpenCard(null)
		} else {
			await getDetailedResponse(responseId)
			setOpenCard(responseId)
		}
	}

	const handleReject = async (responseId: number) => {
		await rejectResponse(responseId, mutate)
		setOpenCard(null)
	}

	const handleAccept = async (responseId: number) => {
		await acceptResponse(responseId, mutate)
		await getDetailedResponse(responseId)
	}

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

							{!rejectResponse && (
								<Button
									style={{ fontSize: '14px' }}
									variant="primary"
									size="md"
									className={s.denyBtn}
									onClick={() => handleReject(response.id)}>
									Отклонить
								</Button>
							)}
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
									Стоимость консультации:{' '}
									<span>
										{/* @ts-expect-error fix it */}
										{detailedResponse?.consultation_price === '0.00'
											? 'Бесплатно'
											: Number(detailedResponse?.consultation_price) + ' ₸' || 'не указано'}
									</span>
								</li>
								<li className={s.tag}>
									Специальность: <span>{detailedResponse?.specialization || 'не указано'}</span>
								</li>
								<li className={s.phone}>
									<div className={s.left}>
										Номер телефона:{' '}
										<span>
											{!response.is_accepted
												? 'Скрыт'
												: detailedResponse?.contacts?.phone === null
												? 'Не указан'
												: detailedResponse?.contacts?.phone}
										</span>
									</div>

									{response.is_accepted && (
										<div className={s.right}>
											<Button
												variant="clear"
												size="sm"
												className={s.callbackBtn}
												onClick={() => window.open(`tel:${detailedResponse?.contacts?.phone}`)}>
												Получить обратный звонок
											</Button>
										</div>
									)}
								</li>
								<li className={s.phone}>
									<div className={s.left}>
										WhatsApp:{' '}
										<span>
											{!response.is_accepted
												? 'Скрыт'
												: detailedResponse?.contacts?.whatsapp === null
												? 'Не указан'
												: detailedResponse?.contacts?.whatsapp}
										</span>
									</div>
									{response.is_accepted && detailedResponse?.contacts?.whatsapp && (
										<div className={s.right}>
											<AppLink
												variant="clear"
												size="auto"
												href={`https://api.whatsapp.com/send/?phone=${detailedResponse?.contacts?.whatsapp}`}
												target={'_blank'}>
												<Image
													src={whatsapp}
													alt="whatsapp"
													width={30}
													height={30}
												/>
											</AppLink>
										</div>
									)}
								</li>
								<li className={s.phone}>
									<div className={s.left}>
										Telegram:{' '}
										<span>
											{!response.is_accepted
												? 'Скрыт'
												: detailedResponse?.contacts?.telegram === null
												? 'Не указан'
												: detailedResponse?.contacts?.telegram}
										</span>
									</div>
									{response.is_accepted && detailedResponse?.contacts?.telegram && (
										<div className={s.right}>
											<AppLink
												variant="clear"
												size="auto"
												href={getTelegramLink(detailedResponse?.contacts?.telegram)}
												target={'_blank'}>
												<Image
													src={telegram}
													alt="telegram"
													width={30}
													height={30}
												/>
											</AppLink>
										</div>
									)}
								</li>
							</ul>
						</div>

						<div className={s.cardDetaildBottom}>
							<div className={s.btns}>
								{!response.is_accepted ? (
									<div className={s.notAcceptedBtns}>
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
								) : (
									<Button
										variant="primary"
										className={s.agreeBtn}
										onClick={() => toggleCard(response.id)}>
										Свернуть
									</Button>
								)}
							</div>
							<ReportButton
								userId={lawyer.id}
								role="lawyer"
							/>
						</div>
					</div>
				)}
			</motion.article>
		)
	}

	const isCardOpen = data.responses.some((r) => r.id === openCard)

	let responsesToRender = []

	if (isCardOpen) {
		responsesToRender = [
			...data.responses.filter((r) => r.id === openCard),
			...data.responses.filter((r) => r.id !== openCard && (!r.is_rejected || r.is_accepted)),
		]
	} else {
		responsesToRender = data.responses.filter((r) => !r.is_rejected || r.is_accepted)
	}

	const openResponse = data.responses.find((r) => r.id === openCard)
	const otherResponses = data.responses.filter((r) => r.id !== openCard && (!r.is_rejected || r.is_accepted))

	return (
		<section className={s.cards}>
			{data.responses.filter((r) => !r.is_rejected && !r.is_accepted).length > 0 && (
				<div className={s.notificationsBox}>
					<p>Отклики юристов:</p>
					<span className={s.notification}>
						{data.responses.filter((r) => !r.is_rejected && !r.is_accepted).length}
					</span>
				</div>
			)}

			<AnimatePresence mode="popLayout">
				{openResponse && renderResponseCard(data, openResponse, true)}

				{openResponse && otherResponses.length > 0 && (
					<div className={s.othersBox}>
						<p className={s.others}>Другие специалисты:</p>
						{otherResponses.map((response) => renderResponseCard(data, response, false))}
					</div>
				)}

				{!openResponse &&
					data.responses
						.filter((r) => !r.is_rejected || r.is_accepted)
						.map((response) => renderResponseCard(data, response, false))}
			</AnimatePresence>
		</section>
	)
}
