'use client'

import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useState } from 'react'
import { Switch } from '@headlessui/react'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'

import { Button } from '@/shared/ui-kit'

import s from './NewPaymentPopup.module.scss'
import { Modal, useModal } from '@/shared/ui-kit'
import { useSubscriptionStore } from '../../model'
import { lawyerApi } from '@/shared/api'

export const NewPaymentPopup = ({ isOpen, close }: { isOpen: boolean; close: () => void }) => {
	const t = useTranslations('newPaymentPopup')
	const stripe = useStripe()
	const elements = useElements()
	const [loading, setLoading] = useState(false)
	const [saveCard, setSaveCard] = useState(false)

	const planId = useSubscriptionStore((state) => state.planId)
	const isAutoRenew = useSubscriptionStore((state) => state.isAutoRenew)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!stripe || !elements) return
		setLoading(true)

		const card = elements.getElement(CardNumberElement)
		const { error, paymentMethod } = await stripe.createPaymentMethod({ type: 'card', card })

		if (error) {
			toast.error(error.message)
		} else {
			console.log('Created payment method:', paymentMethod)
			try {
				await lawyerApi.subscribe(planId, isAutoRenew)
				toast.success('Подписка успешно оформлена!')
				close()
			} catch (e) {
				toast.error('Ошибка при оформлении подписки')
			}
		}

		setLoading(false)
	}

	return (
		<Modal
			className={s.modal}
			isOpen={isOpen}
			onClose={close}
			closeButton={true}
			title={'Новая карта'}>
			<form
				onSubmit={handleSubmit}
				className={s.form}>
				<label className={s.label}>{t('cardNumber')}</label>
				<div className={s.input}>
					<CardNumberElement />
				</div>

				<div className={s.row}>
					<div>
						<label className={s.label}>MM/ЖЖ</label>
						<div className={s.input}>
							<CardExpiryElement />
						</div>
					</div>
					<div>
						<label className={s.label}>CVV</label>
						<div className={s.input}>
							<CardCvcElement />
						</div>
					</div>
				</div>

				<p className={s.note}>{t('securityNote')}</p>

				<div className={s.switchRow}>
					<span className={s.switchLabel}>{t('saveForFuture')}</span>
					<Switch
						checked={saveCard}
						onChange={setSaveCard}
						className={`${s.switch} ${saveCard ? s.switchChecked : ''}`}>
						<span className={`${s.thumb} ${saveCard ? s.thumbChecked : ''}`} />
					</Switch>
				</div>

				<Button
					variant={'primary'}
					size={'full'}
					className={s.submit}
					type="submit"
					disabled={loading || !stripe}>
					{loading ? t('processing') : t('submit')}
				</Button>
			</form>
		</Modal>
	)
}
