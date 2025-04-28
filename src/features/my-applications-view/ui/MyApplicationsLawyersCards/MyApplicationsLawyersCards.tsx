'use client'

import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { Button, mockCard } from '@/shared'
import avatar from '@/app/assets/icons/avatar.webp'

import s from './MyApplicationsLawyersCards.module.scss'

export const MyApplicationsLawyersCards = () => {
	const [openCard, setOpenCard] = useState<number | null>(null)

	const toggleCard = (id: number) => {
		setOpenCard((prevState) => (prevState === id ? null : id))
	}

	const renderCard = (data: any, index: number, isOpen: boolean) => (
		<motion.article
			key={index}
			layout
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className={`${s.card} ${isOpen ? s.openCard : ''}`}>
			<div className={s.cardPreview}>
				<div className={`${s.left} ${isOpen ? s.leftOpen : ''}`}>
					<Image
						src={avatar}
						alt={'аватарка'}
						width={40}
						height={40}
						className={s.avatar}
					/>

					<div className={s.userName}>
						<p className={s.name}>{data.name}</p>
						<p className={s.job}>{data.job}</p>
					</div>
				</div>
				{!isOpen && (
					<div className={s.btns}>
						<Button
							variant={'border'}
							size={'md'}
							className={s.toggleBtn}
							onClick={() => toggleCard(index)}>
							Посмотреть
						</Button>
						<Button
							variant={'primary'}
							size={'md'}
							className={s.denyBtn}
							onClick={() => console.log('deny')}>
							Отклонить
						</Button>
					</div>
				)}
			</div>

			{isOpen && (
				<>
					<div className={s.cardDetails}>
						<ul className={`${s.cardDetailsList} ${isOpen ? s.open : ''}`}>
							<li className={s.city}>
								Город: <span>{data.city}</span>
							</li>
							<li className={s.cost}>
								Стоимость консультации: <span>{data.costs}</span>
							</li>
							<li className={s.tag}>
								Спeцализация: <span>{data.tag}</span>
							</li>
							<li
								style={{ border: 'none' }}
								className={s.phone}>
								Номер телефона: <span>{data.phone}</span>
							</li>
							<li
								style={{ border: 'none' }}
								className={s.phone}>
								Whatsapp: <span>{data.phone}</span>
							</li>
						</ul>
					</div>

					<div className={s.cardDetaildBottom}>
						<div className={s.btns}>
							<Button
								variant={'primary'}
								className={s.agreeBtn}
								onClick={() => toggleCard(index)}>
								Принять
							</Button>

							<Button
								variant={'danger'}
								className={s.denyRedBtn}
								onClick={() => console.log('deny')}>
								Отказать
							</Button>
						</div>

						<Button
							variant={'clear'}
							size={'auto'}
							className={s.reportBtn}
							onClick={() => console.log('deny')}>
							Пожаловаться на юриста
						</Button>
					</div>
				</>
			)}
		</motion.article>
	)

	return (
		<>
			<p className={s.quantity}>
				Отклики юристов: <span>{mockCard.length}</span>
			</p>
			<AnimatePresence mode="popLayout">
				<div className={s.cards}>
					{openCard !== null ? (
						<>
							{renderCard(mockCard[openCard], openCard, true)}

							<motion.div
								className={s.others}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}>
								<h6 className={s.othersTitle}>Другие специалисты:</h6>
								{mockCard.map((data, index) => {
									if (index === openCard) return null
									return renderCard(data, index, false)
								})}
							</motion.div>
						</>
					) : (
						mockCard.map((data, index) => renderCard(data, index, false))
					)}
				</div>
			</AnimatePresence>
		</>
	)
}
