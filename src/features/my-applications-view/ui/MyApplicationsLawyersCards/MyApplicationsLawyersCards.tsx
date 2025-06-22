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
	const t = useTranslations('myApplications.lawyersCard')
	const [openCard, setOpenCard] = useState<number | null>(null)
	const [calledResponses, setCalledResponses] = useState<number[]>([])

	const { acceptResponse, rejectResponse, getDetailedResponse, detailedResponse, createCallback } =
		useMyApplicationsStore()

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

	const handleCallback = async (id: number) => {
		await createCallback(id)
		setCalledResponses((prev) => [...prev, id])
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
							<p className={s.name}>{lawyer?.name || t('noName')}</p>
							<p className={s.job}>{application.tag?.name || t('noSpec')}</p>
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
								{t('view')}
							</Button>

							{!rejectResponse && (
								<Button
									style={{ fontSize: '14px' }}
									variant="primary"
									size="md"
									className={s.denyBtn}
									onClick={() => handleReject(response.id)}>
									{t('reject')}
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
									{t('city')}: <span>{detailedResponse?.region || '—'}</span>
								</li>
								<li className={s.cost}>
									{t('price')}:{' '}
									<span>
										{/* @ts-expect-error fix it */}
										{detailedResponse?.consultation_price === '0.00'
											? t('free')
											: Number(detailedResponse?.consultation_price) + ' ₸' || t('notProvided')}
									</span>
								</li>
								<li className={s.tag}>
									{t('specialization')}: <span>{detailedResponse?.specialization || t('notProvided')}</span>
								</li>
								<li className={s.phone}>
									<div className={s.left}>
										{t('phone')}:{' '}
										<span>
											{!response.is_accepted ? t('hidden') : (detailedResponse?.contacts?.phone ?? t('notSpecified'))}
										</span>
									</div>
									{response.is_accepted && (
										<div className={s.right}>
											<Button
												variant="clear"
												size="sm"
												className={s.callbackBtn}
												disabled={calledResponses.includes(response.id)}
												onClick={() => handleCallback(response.id)}>
												{calledResponses.includes(response.id) ? t('callbackReceived') : t('callbackRequest')}
											</Button>
										</div>
									)}
								</li>
								<li className={s.phone}>
									<div className={s.left}>
										{t('whatsapp')}:{' '}
										<span>
											{!response.is_accepted
												? t('hidden')
												: (detailedResponse?.contacts?.whatsapp ?? t('notSpecified'))}
										</span>
									</div>
									{response.is_accepted && detailedResponse?.contacts?.whatsapp && (
										<div className={s.right}>
											<AppLink
												variant="clear"
												size="auto"
												href={`https://api.whatsapp.com/send/?phone=${detailedResponse.contacts.whatsapp}`}
												target="_blank">
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
										{t('telegram')}:{' '}
										<span>
											{!response.is_accepted
												? t('hidden')
												: (detailedResponse?.contacts?.telegram ?? t('notSpecified'))}
										</span>
									</div>
									{response.is_accepted && detailedResponse?.contacts?.telegram && (
										<div className={s.right}>
											<AppLink
												variant="clear"
												size="auto"
												href={getTelegramLink(detailedResponse.contacts.telegram)}
												target="_blank">
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
											{t('accept')}
										</Button>
										<Button
											variant="danger"
											className={s.denyRedBtn}
											onClick={() => handleReject(response.id)}>
											{t('deny')}
										</Button>
									</div>
								) : (
									<Button
										variant="primary"
										className={s.agreeBtn}
										onClick={() => toggleCard(response.id)}>
										{t('collapse')}
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

	let responsesToRender = []
	const isCardOpen = data.responses.some((r) => r.id === openCard)

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
					<p>{t('responsesFromLawyers')}</p>
					<span className={s.notification}>
						{data.responses.filter((r) => !r.is_rejected && !r.is_accepted).length}
					</span>
				</div>
			)}

			<AnimatePresence mode="popLayout">
				{openResponse && renderResponseCard(data, openResponse, true)}

				{openResponse && otherResponses.length > 0 && (
					<div className={s.othersBox}>
						<p className={s.others}>{t('otherSpecialists')}</p>
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
