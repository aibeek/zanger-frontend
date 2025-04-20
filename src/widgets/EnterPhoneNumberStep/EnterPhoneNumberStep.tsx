'use client'

import Link from 'next/link'
import { IMaskInput } from 'react-imask'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button, Input } from '@/shared/ui-kit'
import { useEnterPhone } from '@/features/auth/register'
import { PhoneAuthVariant, useStepMarcher, phoneSchema, PhoneSchemaType } from '@/shared'

import s from './EnterPhoneNumberStep.module.scss'

type Props = { warning?: boolean; variant: PhoneAuthVariant }

export const EnterPhoneNumberStep = ({ warning = true, variant }: Props) => {
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

	return (
		<div className={s.wrapper}>
			<div className={s.inner}>
				<div className={s.top}>
					<h1 className={s.title}>Введите номер телефона</h1>
					<p className={s.descr}>Отправим СМС с кодом подтверждения</p>
				</div>

				<form
					className={s.form}
					onSubmit={handleSubmit(onSubmit)}>
					<label className={s.label}>Номер телефона</label>
					<Controller
						name="phone"
						control={control}
						render={({ field: { onChange, onBlur, value, ref } }) => (
							<Input
								type="tel"
								placeholder="Введите номер телефона"
								hasError={!!errors.phone || !!error}
								disabled={loading}
								// @ts-expect-error fix it
								as={IMaskInput}
								mask="+{7} (000) 000-00-00"
								value={value}
								onAccept={(phone: string) => {
									onChange(phone)
									if (error) resetState()
								}}
								onBlur={onBlur}
								inputRef={ref}
								unmask={true}
							/>
						)}
					/>

					{(errors.phone?.message || error) && <p className={s.error}>{errors.phone?.message || error}</p>}

					<Button
						className={s.btn}
						variant="primary"
						size="full"
						type="submit"
						disabled={loading || disableAfterError}>
						{loading ? 'Отправка...' : 'Получить код'}
					</Button>
				</form>

				{warning && (
					<div className={s.warning}>
						<p>
							Активируя функцию «Получить код», вы соглашаетесь
							<Link
								className={s.link}
								target={'_blank'}
								href="/*">
								{' '}
								с условиями использования и правилами обработки персональных данных
							</Link>
						</p>
					</div>
				)}
			</div>
		</div>
	)
}
