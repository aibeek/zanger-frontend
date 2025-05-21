'use client'

import Link from 'next/link'
import { IMaskInput } from 'react-imask'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'

import { Button, Input } from '@/shared/ui-kit'
import { PhoneAuthVariant } from '@/shared/api'
import { useEnterPhone } from '@/features/auth/register'
import { useStepMarcher, phoneSchema, PhoneSchemaType, useFormError } from '@/shared/lib'

import s from './EnterPhoneNumberStep.module.scss'
import { termsURL } from '@/shared/lib/consts/urls'

type Props = { warning?: boolean; variant: PhoneAuthVariant }

export const EnterPhoneNumberStep = ({ warning = true, variant }: Props) => {
	const t = useTranslations()
	const { phone, sendPhoneNumber, loading, error, setPhone, disableAfterError, resetState } = useEnterPhone()
	const { nextStep } = useStepMarcher()

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<PhoneSchemaType>({
		resolver: zodResolver(phoneSchema),
		defaultValues: { phone: phone || '' },
	})

	const onSubmit = async (data: PhoneSchemaType) => {
		const rawPhone = data.phone.replace(/\D/g, '')
		setPhone(data.phone)
		await sendPhoneNumber(rawPhone, nextStep, variant)
	}

	const { translatedError } = useFormError(error, errors)

	return (
		<div className={s.wrapper}>
			<div className={s.inner}>
				<div className={s.top}>
					<h1 className={s.title}>{t('auth.enterPhone.title')}</h1>
					<p className={s.descr}>{t('auth.enterPhone.description')}</p>
				</div>

				<form
					className={s.form}
					onSubmit={handleSubmit(onSubmit)}>
					<label className={s.label}>{t('auth.enterPhone.label')}</label>
					<Controller
						name="phone"
						control={control}
						render={({ field: { onChange, onBlur, value, ref } }) => (
							<Input
								autoFocus
								type="tel"
								placeholder={t('auth.enterPhone.placeholder')}
								hasError={!!errors.phone || !!error}
								disabled={loading}
								// @ts-expect-error fix it
								as={IMaskInput}
								mask="+{7} (000) 000-00-00"
								value={value}
								onAccept={(phone: string) => {
									onChange(phone)
									if (disableAfterError) resetState()
								}}
								onBlur={onBlur}
								inputRef={ref}
								unmask={true}
							/>
						)}
					/>

					{translatedError && <p className={s.error}>{translatedError}</p>}

					<Button
						className={s.btn}
						variant="primary"
						size="full"
						type="submit"
						disabled={loading || disableAfterError}>
						{loading ? t('auth.enterPhone.submitting') : t('auth.enterPhone.submit')}
					</Button>
				</form>

				{warning && (
					<div className={s.warning}>
						<p>
							{t('auth.enterPhone.agreement')}
							<Link
								className={s.link}
								target="_blank"
								href={termsURL}>
								{' '}
								{t('auth.enterPhone.linkText')}
							</Link>
						</p>
					</div>
				)}
			</div>
		</div>
	)
}
