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
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

export const PaymentMethodSelection = () => {
	const t = useTranslations('subscriptionView')
	const { data: cards, isLoading, error, mutate } = useMyCards()
	const [selected, setSelected] = useState<string | null>(null)
	const { addCard } = usePaymentStore()
	const { planId, isAutoRenew } = useSubscriptionStore()
	const router = useRouter()

	const [loadingPayWith, setLoadingPayWith] = useState(false)
	const [loadingPayWithout, setLoadingPayWithout] = useState(false)

	useEffect(() => {
		if (cards?.length) {
			const activeCard = cards.find((card) => card.is_active)
			if (activeCard) setSelected(activeCard.id.toString())
		}
	}, [cards])

	const handlePayWithSavedCard = async () => {
		if (!selected) {
			toast.error(t('selectCard'))
			return
		}
		setLoadingPayWith(true)
		try {
			await lawyerApi.subscribeByCard(planId, selected)
			toast.success(t('paymentSuccess'))
			await refreshUser()
			setTimeout(() => router.push('/dashboard/profile'), 500)
		} catch {
			toast.error(t('errorPayment'))
		} finally {
			setLoadingPayWith(false)
		}
	}

	const handleAddCard = async () => {
		try {
			const redirectUrl = await addCard()
			await mutate()
			await refreshUser()
			if (redirectUrl) {
				window.location.href = redirectUrl
			} else {
				toast.success(t('cardAdded'))
			}
		} catch {
			toast.error(t('error'))
		}
	}

	const handlePayWithoutCard = async () => {
		setLoadingPayWithout(true)
		try {
			const { link } = await lawyerApi.subscribe(planId, isAutoRenew)
			window.location.href = link
			await refreshUser()
		} catch {
			toast.error(t('paymentRedirectError'))
		} finally {
			setLoadingPayWithout(false)
		}
	}

	return (
		<>
			<div className={s.radioGroup}>
				{isLoading ? (
					<Loader />
				) : error ? (
					<div className={s.error}>{t('errorLoading')}</div>
				) : (
					cards.map((card) => (
						<div
							key={card.id}
							onClick={() => setSelected(card.id.toString())}
							className={clsx(s.option, { [s.checked]: selected === card.id.toString() })}>
							<div className={s.left}>
								<div className={s.cardBox}>
									<span className={s.text}>{card.bank_name}</span>
								</div>
								<div className={s.cardInfo}>
									<span className={s.text}>{card.bank_account}</span>
								</div>
							</div>
							<div className={s.circle}>
								{selected === card.id.toString() && <div className={s.innerCircle} />}
							</div>
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
						<span className={s.text}>{t('addNewCard')}</span>
					</div>
				</Button>
			</div>

			<div className={s.actions}>
				<Button
					onClick={handlePayWithoutCard}
					variant="border"
					disabled={loadingPayWithout}>
					{loadingPayWithout ? t('loading') : t('payWithoutSaving')}
				</Button>
				<Button
					onClick={handlePayWithSavedCard}
					variant="primary"
					disabled={loadingPayWith}>
					{loadingPayWith ? t('loading') : t('payWithCard')}
				</Button>
			</div>
		</>
	)
}
