'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import PaymentMethodIcon from '@/app/assets/icons/payment-method.svg'
import s from './ProfilePaymentMethod.module.scss'
import { ProfileTabWrapper } from '../ProfileTabWrapper'
import { Button, Loader, useModal } from '@/shared/ui-kit'
import { TrashIcon, PlusIcon } from '@heroicons/react/20/solid'
import { useMyCards } from '@/entities/payment/model/useMyCards'
import { usePaymentStore } from '@/entities/payment'
import toast from 'react-hot-toast'
import { NewPaymentPopup } from '@/entities/payment'
import { refreshUser } from '@/shared/lib/helpers/refreshUser'

export const ProfilePaymentMethod = () => {
	const t = useTranslations()
	const disclosureBtnRef = useRef<HTMLButtonElement>(null)
	const { isOpen, close } = useModal()
	const [selected, setSelected] = useState<string | null>(null)
	const { data: cards, isLoading, error, mutate } = useMyCards()
	const { deleteCard, activateCard, addCard } = usePaymentStore()

	const handleSelect = async (value: string) => {
		setSelected(value)
		await activateCard(Number(value))
		await refreshUser()
	}

	const handleRemoveCard = async (e, card) => {
		e.stopPropagation()
		try {
			await deleteCard(card.id)
			await mutate()
			await refreshUser()
			toast.success(t('profile.payment_method.deleteSuccess'))
		} catch (err) {
			toast.error(t('profile.payment_method.deleteError'))
		}
	}

	const handleAddCard = async () => {
		const redirectUrl = await addCard()
		await mutate()
		await refreshUser()
		if (redirectUrl) {
			window.location.href = redirectUrl
		} else {
			toast.success(t('addSuccess'))
		}
	}

	const handleSubmitCard = async (cardData: any) => {
		try {
			// Здесь должна быть логика добавления карты
			console.log('Adding card:', cardData)
			await mutate()
			await refreshUser()
			toast.success(t('profile.payment_method.cardAdded') || 'Карта добавлена')
		} catch (error) {
			toast.error(t('profile.payment_method.deleteError'))
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
			imgAlt={'profile'}
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
									<span className={s.text}>{card.bank_name}</span>
								</div>
								<div className={s.cardInfo}>
									<span className={s.text}>{card.bank_account}</span>
								</div>
							</div>

							<div className={s.actions}>
								<div className={s.circle}>
									{selected === card.id.toString() && <div className={s.innerCircle}></div>}
								</div>
								<Button
									variant="clear"
									size={'auto'}
									className={s.deleteButton}
									onClick={(e) => handleRemoveCard(e, card)}>
									<TrashIcon
										width={24}
										height={24}
										color="red"
									/>
								</Button>
							</div>
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
						<span className={s.text}>{t('profile.payment_method.newCard')}</span>
					</div>
				</Button>
			</div>

			<NewPaymentPopup
				isOpen={isOpen}
				onClose={close}
				onSubmit={handleSubmitCard}
			/>
		</ProfileTabWrapper>
	)
}
