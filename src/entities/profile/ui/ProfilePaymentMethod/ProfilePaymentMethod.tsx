'use client'

import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import clsx from 'clsx'
import PaymentMethodIcon from '@/app/assets/icons/payment-method.svg'
import kaspiIcon from '@/app/assets/icons/kaspi.png'
import s from './ProfilePaymentMethod.module.scss'
import { ProfileTabWrapper } from '../ProfileTabWrapper'
import { Loader, useModal } from '@/shared/ui-kit'
import { PlusIcon } from '@heroicons/react/20/solid'
import Image from 'next/image'
import { NewPaymentPopup } from '@/entities/subscription/ui/SubscriptionView/NewPaymentPopup'
import { useMyCards } from '@/entities/payment/model/useMyCards'
import { usePaymentStore } from '@/entities/payment'
import toast from 'react-hot-toast'

export const ProfilePaymentMethod = () => {
	const t = useTranslations('profile.payment_method')
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
		// после создания — обновляем список карт
		await mutate()
		if (redirectUrl) {
			window.location.href = redirectUrl
		} else {
			toast.success(t('addSuccess'))
		}
	}

	return (
		<ProfileTabWrapper
			title={t('title')}
			imgSrc={PaymentMethodIcon}
			imgAlt="payment"
			panel_title={t('panelTitle')}
			panel_descr={t('panelDescription')}
			ref={disclosureBtnRef}>
			<div className={s.radioGroup}>
				{isLoading ? (
					<Loader />
				) : error ? (
					<div className={s.error}>{t('loadingError')}</div>
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
									<Image
										src={kaspiIcon}
										alt="kaspi"
										width={80}
										height={60}
									/>
								</div>
								<span>{card.title}</span>
							</div>
							<span className={s.circle} />
						</div>
					))
				)}

				<button
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
						<span>{t('newCard')}</span>
					</div>
				</button>
			</div>

			<NewPaymentPopup
				isOpen={isOpen}
				close={close}
			/>
		</ProfileTabWrapper>
	)
}
