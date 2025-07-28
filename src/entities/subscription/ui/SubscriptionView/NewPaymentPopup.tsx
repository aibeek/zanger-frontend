'use client'

import { useState } from 'react'
import { Switch } from '@headlessui/react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'

import { Button, Modal } from '@/shared/ui-kit'
import { useSubscriptionStore } from '../../model'
import { lawyerApi } from '@/shared/api'

import s from './NewPaymentPopup.module.scss'
import { CardPaymentForm, cardPaymentSchema, useFormError } from '@/shared/lib'
import { IMaskInput } from 'react-imask'

export const NewPaymentPopup = ({ isOpen, close }: { isOpen: boolean; close: () => void }) => {
	const t = useTranslations()
	const [loading, setLoading] = useState(false)
	const [saveCard, setSaveCard] = useState(false)
	const { planId, isAutoRenew } = useSubscriptionStore()

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<CardPaymentForm>({
		resolver: zodResolver(cardPaymentSchema),
	})

	const onSubmit = async (data: CardPaymentForm) => {
		setLoading(true)
		try {
			const { link } = await lawyerApi.subscribe(planId, isAutoRenew)
			window.location.href = link
		} catch (e) {
			console.error(e)
			toast.error('Ошибка при оформлении подписки')
			setLoading(false)
		}
	}
	const { translatedFieldErrors } = useFormError(null, errors)

	return (
		<Modal
			className={s.modal}
			isOpen={isOpen}
			onClose={close}
			closeButton={true}
			title={'Новая карта'}>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className={s.form}>
				<label className={s.label}>{t('newPaymentPopup.cardNumber')}</label>
				<div>
					<Controller
						name="cardNumber"
						control={control}
						render={({ field }) => (
							<IMaskInput
								{...field}
								mask="0000 0000 0000 0000"
								placeholder="1234 5678 9012 3456"
								className={s.input}
								onAccept={(value) => field.onChange(value)}
							/>
						)}
					/>
					{translatedFieldErrors.cardNumber && <p className={s.error}>{translatedFieldErrors.cardNumber}</p>}
				</div>
				<div className={s.row}>
					<div>
						<label className={s.label}>MM/ГГ</label>
						<div>
							<Controller
								name="expiry"
								control={control}
								render={({ field }) => (
									<IMaskInput
										{...field}
										mask="00/00"
										placeholder="MM/YY"
										className={s.input}
										onAccept={(value) => field.onChange(value)}
									/>
								)}
							/>
							{translatedFieldErrors.expiry && <p className={s.error}>{translatedFieldErrors.expiry}</p>}
						</div>
					</div>
					<div>
						<label className={s.label}>CVV</label>
						<div>
							<Controller
								name="cvv"
								control={control}
								render={({ field }) => (
									<IMaskInput
										{...field}
										mask="000"
										placeholder="CVV"
										className={s.input}
										onAccept={(value) => field.onChange(value)}
									/>
								)}
							/>
							{translatedFieldErrors.cvv && <p className={s.error}>{translatedFieldErrors.cvv}</p>}
						</div>
					</div>
				</div>

				<p className={s.note}>{t('newPaymentPopup.securityNote')}</p>

				<div className={s.switchRow}>
					<span className={s.switchLabel}>{t('newPaymentPopup.saveForFuture')}</span>
					<Switch
						checked={saveCard}
						onChange={setSaveCard}
						className={`${s.switch} ${saveCard ? s.switchChecked : ''}`}>
						<span className={`${s.thumb} ${saveCard ? s.thumbChecked : ''}`} />
					</Switch>
				</div>

				<Button
					variant="primary"
					size="full"
					className={s.submit}
					type="submit"
					disabled={loading}>
					{loading ? t('newPaymentPopup.processing') : t('newPaymentPopup.submit')}
				</Button>
			</form>
		</Modal>
	)
}
