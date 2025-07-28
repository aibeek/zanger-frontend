'use client'

import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { usePaymentStore } from '@/entities/payment'
import { useMyCards } from '@/entities/payment/model/useMyCards'
import { Button, Loader } from '@/shared/ui-kit'
import { PlusIcon } from '@heroicons/react/20/solid'
import s from './PaymentMethodSelection.module.scss'
import toast from 'react-hot-toast'
import { useSubscriptionStore } from '../../model'
import { lawyerApi } from '@/shared/api'
import { refreshUser } from '@/shared/lib/helpers/refreshUser'

export const PaymentMethodSelection = () => {
	const { data: cards, isLoading, error, mutate } = useMyCards()
	const [selected, setSelected] = useState<string | null>(null)
	const { addCard } = usePaymentStore()
	const { planId, isAutoRenew } = useSubscriptionStore()

	useEffect(() => {
		if (cards?.length) {
			const activeCard = cards.find((c) => c.is_active)
			if (activeCard) setSelected(activeCard.id.toString())
		}
	}, [cards])

	const handlePayWithSavedCard = async () => {
		if (!selected) {
			toast.error('Выберите карту для оплаты')
			return
		}
		try {
			await lawyerApi.subscribeByCard(planId, selected)

			await refreshUser()
			toast.success('Оплата прошла успешно')
		} catch (e) {
			toast.error('Произошла ошибка при оплате')
		}
	}

	const handleAddCard = async () => {
		const redirectUrl = await addCard()
		await mutate()
		await refreshUser()
		if (redirectUrl) {
			window.location.href = redirectUrl
		} else {
			toast.success('Карта успешно добавлена')
		}
	}

	const handlePayWithoutCard = async () => {
		try {
			const { link } = await lawyerApi.subscribe(planId, isAutoRenew)
			window.location.href = link
		} catch (e) {
			toast.error('Не удалось перейти к оплате')
		}
	}

	return (
		<div className={s.paymentOptions}>
			<div className={s.radioGroup}>
				{isLoading ? (
					<Loader />
				) : error ? (
					<div className={s.error}>Ошибка загрузки</div>
				) : (
					cards.map((card) => (
						<div
							key={card.id}
							onClick={() => setSelected(card.id.toString())}
							className={clsx(s.option, {
								[s.checked]: selected === card.id.toString(),
							})}>
							<div className={s.left}>
								<div className={s.cardBox}>
									<span>{card.bank_name}</span>
								</div>
								<div className={s.cardInfo}>
									<span>{card.bank_account}</span>
								</div>
							</div>
							<div className={s.circle}>{selected === card.id.toString() && <div className={s.innerCircle}></div>}</div>
						</div>
					))
				)}

				<Button
					variant="clear"
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
						<span>Добавить новую карту</span>
					</div>
				</Button>
			</div>

			<div className={s.actions}>
				<Button
					onClick={handlePayWithSavedCard}
					size="full">
					Оплатить сохранённой картой
				</Button>
				<Button
					onClick={handlePayWithoutCard}
					size="full"
					variant="border">
					Оплатить без сохранения карты
				</Button>
			</div>
		</div>
	)
}
