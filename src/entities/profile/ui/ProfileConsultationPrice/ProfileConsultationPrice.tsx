'use client'

import clsx from 'clsx'
import { IMaskInput } from 'react-imask'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import { RadioGroup } from '@headlessui/react'

import { Button, Input } from '@/shared/ui-kit'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLoginStore } from '@/features/auth'
import consultationIcon from '@/app/assets/icons/consultation-price.svg'
import { profileConsultationPriceSchema, ProfileConsultationPriceSchema } from '@/shared/lib'

import s from './ProfileConsultationPrice.module.scss'
import { ProfileTabWrapper } from '../ProfileTabWrapper'
import { useConsultationPriceStore } from '../../model/useConsultationPriceStore'
import { LawyerProfile, UserProfile } from '@/shared/lib/types'

const OPTIONS = [
	{ label: 'Бесплатно', value: 'free' },
	{ label: 'Указать цену', value: 'paid' },
]

export const ProfileConsultationPrice = () => {
	const disclosureBtnRef = useRef<HTMLButtonElement>(null)
	const t = useTranslations('profile.consultation_price')
	const [selected, setSelected] = useState<'free' | 'paid'>('paid')
	const personalData: UserProfile = useLoginStore((state) => state.personalData)
	const { updateConsultationPrice, isSubmitting } = useConsultationPriceStore()

	const {
		handleSubmit,
		formState: { errors },
		reset,
		control,
	} = useForm<ProfileConsultationPriceSchema>({
		resolver: zodResolver(profileConsultationPriceSchema),
	})

	const onSubmit = async (data: ProfileConsultationPriceSchema) => {
		const payload = {
			consultation_price: selected === 'free' ? 0 : Number(data.consultation_price?.replace(/\s/g, '')),
		}

		await updateConsultationPrice(payload)
		reset()
		setSelected('paid')
		disclosureBtnRef.current.click()
	}

	return (
		<ProfileTabWrapper
			title={t('title')}
			imgSrc={consultationIcon}
			imgAlt="personalData"
			panel_title={t('panelTitle')}
			panel_descr={t('panelDescription')}
			ref={disclosureBtnRef}>
			<form
				className={s.form}
				onSubmit={handleSubmit(onSubmit)}>
				<RadioGroup
					value={selected}
					onChange={setSelected}
					name="price">
					<div className={s.radioGroup}>
						{OPTIONS.map((option) => (
							<RadioGroup.Option
								key={option.value}
								value={option.value}
								className={({ checked }) => clsx(s.option, { [s.checked]: checked })}>
								<>
									<span>{option.label}</span>
									<span className={s.circle} />
								</>
							</RadioGroup.Option>
						))}
					</div>
				</RadioGroup>

				{selected === 'paid' && (
					<div className={s.inputGroup}>
						<label className={s.label}>Укажите стоимость консультации</label>
						<div className={s.inputWrapper}>
							<Controller
								name="consultation_price"
								control={control}
								render={({ field: { onChange, onBlur, value, ref } }) => (
									<Input
										// @ts-expect-error fix it
										as={IMaskInput}
										inputRef={ref}
										mask={Number}
										scale={0}
										thousandsSeparator=" "
										radix="."
										mapToRadix={[]}
										unmask={true}
										value={value}
										onAccept={(val: string) => {
											const parsed = val.replace(/\s/g, '')
											onChange(parsed)
										}}
										onBlur={onBlur}
										// @ts-expect-error fix it
										placeholder={personalData.lawyer?.consultation_price}
									/>
								)}
							/>

							<span className={s.currency}>₸</span>
						</div>
						{errors.consultation_price && <p style={{ color: 'red' }}>{errors.consultation_price.message}</p>}
					</div>
				)}

				<Button
					type="submit"
					variant="primary"
					size="auto"
					style={{ padding: '8px 30px', marginTop: '-22px' }}
					disabled={isSubmitting}
					className={s.submitButton}>
					{isSubmitting ? 'Сохранение...' : 'Сохранить'}
				</Button>
			</form>
		</ProfileTabWrapper>
	)
}
