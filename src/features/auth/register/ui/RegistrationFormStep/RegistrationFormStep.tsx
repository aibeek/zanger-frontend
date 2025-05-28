'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button, Input } from '@/shared/ui-kit'
import { LawyerRegisterDto } from '@/shared/api'
import {
	clientRegistrationSchema,
	formatPhoneNumber,
	lawyerRegistrationSchema,
	regionGroupBy,
	sortRegions,
} from '@/shared/lib'

import s from './RegistrationFormStep.module.scss'
import { SearchSelect } from '../SearchSelect'
import { useEnterPhone, useRegisterFormByVariant, useLawyerTypesStore, useRegions } from '../../model'
import { useTranslations } from 'next-intl'
import { policyURL } from '@/shared/lib/consts/urls'

export const RegistrationFormStep = ({ variant }: { variant: 'client' | 'lawyer' }) => {
	const t = useTranslations()
	const router = useRouter()
	const { phone } = useEnterPhone()
	const { regions, loadingRegions } = useRegions()
	const { setField, sendData, resetState, loading } = useRegisterFormByVariant(variant)
	const { lawyerTypes, fetchLawyerTypes, loadingLawyerTypes } = useLawyerTypesStore()

	const clientVariant = variant === 'client'
	const lawyerVariant = variant === 'lawyer'

	const {
		register,
		handleSubmit,
		watch,
		control,
		formState: { errors },
	} = useForm<LawyerRegisterDto>({
		defaultValues: {
			phone,
		},

		//@ts-expect-error fix it
		resolver: zodResolver(variant === 'client' ? clientRegistrationSchema : lawyerRegistrationSchema),
		mode: 'onChange',
	})

	useEffect(() => {
		if (lawyerVariant) fetchLawyerTypes()
	}, [])

	const onSubmit = async (data: any) => {
		await sendData(async () => {
			resetState()
			router.push(`/auth/login`)
		})
	}

	useEffect(() => {
		const subscription = watch((value, { name }) => {
			if (!name) return
			const val = value[name as keyof typeof value]
			//@ts-expect-error fix it
			setField(name as keyof typeof value, val)
		})

		return () => subscription.unsubscribe()
	}, [watch])

	useEffect(() => {
		setField('phone', phone)
	}, [phone, setField])

	const sortedRegions = sortRegions(regions)

	return (
		<div className={s.wrapper}>
			<div className={s.inner}>
				<div className={s.top}>
					<h1 className={s.title}>{t('auth.registration.title')}</h1>
				</div>

				<form onSubmit={handleSubmit(onSubmit)}>
					<div className={`${s.phone} ${s.inputBox}`}>
						<label className={s.label}>{t('auth.registration.phoneLabel')}</label>
						<Input
							{...register('phone')}
							value={formatPhoneNumber(phone)}
							placeholder={formatPhoneNumber(phone)}
							disabled
						/>
					</div>
					<div className={`${s.name} ${s.inputBox}`}>
						<label className={s.label}>
							{clientVariant ? t('auth.registration.nameLabel') : t('auth.registration.lawyerNameLabel')}
						</label>
						<Input
							placeholder={
								clientVariant ? t('auth.registration.namePlaceholder') : t('auth.registration.lawyerNamePlaceholder')
							}
							{...register('name', { required: t('auth.registration.nameRequired') })}
							hasError={!!errors.name}
						/>
						{errors.name && <p className={s.error}>{t(errors.name.message)}</p>}
					</div>

					{lawyerVariant && (
						<div className={`${s.iin} ${s.inputBox}`}>
							<label className={s.label}>{t('auth.registration.iinLabel')}</label>
							<Input
								type="text"
								placeholder={t('auth.registration.iinPlaceholder')}
								maxLength={12}
								inputMode="numeric"
								{...register('iin', { required: t('auth.registration.iinRequired') })}
								onInput={(e) => {
									const input = e.target as HTMLInputElement
									input.value = input.value.replace(/\D/g, '').slice(0, 12)
								}}
								hasError={!!errors.iin}
							/>
							{errors.iin && <p className={s.error}>{t(errors.iin.message)}</p>}
						</div>
					)}

					<div className={`${s.city} ${s.inputBox}`}>
						<label className={s.label}>{t('auth.registration.cityLabel')}</label>
						<Controller
							name="region_id"
							control={control}
							rules={{ required: t('auth.registration.regionRequired') }}
							render={({ field }) => {
								const selectedRegion = sortedRegions.find((r) => r.id === field.value)

								return (
									<SearchSelect
										className="search-select"
										data={sortedRegions}
										loading={loadingRegions}
										value={selectedRegion || null}
										onChange={(item) => {
											field.onChange(item ? item.id : null)
										}}
										getId={(item) => item.id}
										getLabel={(item) => item.name}
										groupBy={regionGroupBy}
										renderGroupLabel={(label) => <span>{label.slice(3)}</span>}
										placeholder={t('auth.registration.regionPlaceholder')}
									/>
								)
							}}
						/>
						{errors.region_id && <p className={s.error}>{t(errors.region_id.message)}</p>}
					</div>

					{lawyerVariant && (
						<div className={`${s.specialization} ${s.inputBox}`}>
							<label className={s.label}>{t('auth.registration.specializationLabel')}</label>
							<Controller
								name="lawyer_type_id"
								control={control}
								rules={{ required: t('auth.registration.specializationRequired') }}
								render={({ field }) => (
									<SearchSelect
										className={`search-select`}
										data={[...lawyerTypes].sort((a, b) => a.name.localeCompare(b.name))}
										loading={loadingLawyerTypes}
										value={lawyerTypes.find((item) => item.id === field.value)}
										// @ts-expect-error fix it
										onChange={(item) => field.onChange(item?.id)}
										getId={(item) => item.id}
										getLabel={(item) => item.name}
										placeholder={t('auth.registration.specializationPlaceholder')}
									/>
								)}
							/>
							{errors.lawyer_type_id && <p className={s.error}>{t(errors.lawyer_type_id.message)}</p>}
						</div>
					)}

					<div className={`${s.password} ${s.inputBox}`}>
						<label className={s.label}>{t('auth.registration.passwordLabel')}</label>
						<Input
							type="password"
							placeholder={t('auth.registration.passwordPlaceholder')}
							{...register('password')}
							hasError={!!errors.password}
						/>
						<p className={`${s.descr} ${errors.password ? s.descrError : ''}`}>
							{t('auth.registration.passwordDescr')}
						</p>
					</div>
					<div className={`${s.password_confirmation} ${s.inputBox}`}>
						<label className={s.label}>{t('auth.registration.passwordConfirmationLabel')}</label>
						<Input
							type="password"
							placeholder={t('auth.registration.passwordConfirmationPlaceholder')}
							{...register('password_confirmation')}
							hasError={!!errors.password_confirmation}
						/>
						{errors.password_confirmation && <p className={s.error}>{t(errors.password_confirmation.message)}</p>}
					</div>

					<div className={s.submit}>
						<Button
							className={s.btn}
							size={'full'}
							type="submit"
							disabled={loading}>
							{loading ? t('auth.registration.loading') : t('auth.registration.submit')}
						</Button>
					</div>
				</form>

				<div className={s.warning}>
					<p>{t('auth.registration.warningText')}</p>
					<Link
						target={'_blank'}
						href={policyURL}>
						{t('auth.registration.privacyPolicy')}
					</Link>
				</div>
			</div>
		</div>
	)
}
