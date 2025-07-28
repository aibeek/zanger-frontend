'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import PaymentMethodIcon from '@/app/assets/icons/payment-method.svg'
import kaspiIcon from '@/app/assets/icons/kaspi.png'
import s from './ProfilePaymentMethod.module.scss'
import { ProfileTabWrapper } from '../ProfileTabWrapper'
import { Button, Loader, useModal } from '@/shared/ui-kit'
import { PlusIcon } from '@heroicons/react/20/solid'
import Image from 'next/image'
import { useMyCards } from '@/entities/payment/model/useMyCards'
import { usePaymentStore } from '@/entities/payment'
import toast from 'react-hot-toast'
import { NewPaymentPopup } from '@/entities/subscription/ui/SubscriptionView/NewPaymentPopup'

export const ProfilePaymentMethod = () => {
	const t = useTranslations()
	const disclosureBtnRef = useRef<HTMLButtonElement>(null)
	const { open, isOpen, close } = useModal()
	const [selected, setSelected] = useState<string | null>(null)
	const { data: cards, isLoading, error, mutate } = useMyCards()
	const { deleteCard, activateCard, addCard } = usePaymentStore()

	const handleSelect = async (value: string) => {
		setSelected(value)
		await activateCard(Number(value))
		await mutate()
	}

	const handleAddCard = async () => {
		const redirectUrl = await addCard()
		await mutate()
		if (redirectUrl) {
			window.location.href = redirectUrl
		} else {
			toast.success(t('addSuccess'))
		}
	}

	useEffect(() => {
		if (cards?.length && !selected) {
			const activeCard = cards.find((card) => card.is_active)
			if (activeCard) {
				setSelected(activeCard.id.toString())
			}
		}
	}, [cards])

	return (
		<ProfileTabWrapper
			title={t('profile.payment_method.title')}
			imgSrc={PaymentMethodIcon}
			imgAlt="profile.payment_method.payment"
			panel_title={t('profile.payment_method.panelTitle')}
			panel_descr={t('profile.payment_method.panelDescription')}
			ref={disclosureBtnRef}>
			<div className={s.radioGroup}>
				{isLoading ? (
					<Loader />
				) : error ? (
					<div className={s.error}>ошибка</div>
				) : (
					cards.map((card) => (
						<div
							key={card.id}
							onClick={() => handleSelect(card.id.toString())}
							className={clsx(s.option, {
								[s.checked]: selected === card.id.toString(),
							})}>
							<div className={s.left}>
								<div className={s.cardBox}>
									{/* <Image
										src={kaspiIcon}
										alt={card.bank_name}
										width={80}
										height={60}
									/> */}
									<span>{card.bank_name}</span>
								</div>
								<div className={s.cardInfo}>
									<span>{card.bank_account}</span>
								</div>
							</div>

							{/* Радиокнопка */}
							<div className={s.circle}>{selected === card.id.toString() && <div className={s.innerCircle}></div>}</div>
						</div>
					))
				)}

				<Button
					variant={'clear'}
					onClick={handleAddCard}
					className={clsx(s.option, s.optionAddCard)}>
					<div className={s.left}>
						<div className={s.cardBoxNew}>
							<PlusIcon
								width={24}
								height={24}
								color="rgba(2, 125, 255, 1)"
							/>
						</div>
						<span>{t('profile.payment_method.newCard')}</span>
					</div>
				</Button>
			</div>

			<NewPaymentPopup
				isOpen={isOpen}
				close={close}
			/>
		</ProfileTabWrapper>
	)
}
