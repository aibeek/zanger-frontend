'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button, clientRegistrationSchema, formatPhoneNumber, Input, lawyerRegistrationSchema } from '@/shared'

import s from './RegistrationFormStep.module.scss'
import { useCitiesStore } from '../../model/citiesStore'
import { SpecializationSelect } from '../SpecializationSelect'
import { useEnterPhone, useRegisterFormByVariant, useSpecializationsStore } from '../../model'
import { SearchSelect } from '../SearchSelect'

export const RegistrationFormStep = ({ variant }: { variant: 'client' | 'lawyer' }) => {
	const router = useRouter()
	const { phone } = useEnterPhone()
	const { locale, role } = useParams()
	const { cities, fetchCities, loadingCities } = useCitiesStore()
	const { setField, sendData, resetState, loading } = useRegisterFormByVariant(variant)
	const { specializations, fetchSpecializations, loadingSpecializations } = useSpecializationsStore()

	const clientVariant = variant === 'client'
	const lawyerVariant = variant === 'lawyer'

	const {
		register,
		handleSubmit,
		watch,
		control,
		formState: { errors },
	} = useForm({
		defaultValues: {
			phone,
		},
		resolver: zodResolver(variant === 'client' ? clientRegistrationSchema : lawyerRegistrationSchema),
		mode: 'onChange',
	})

	useEffect(() => {
		fetchCities()
		if (lawyerVariant) fetchSpecializations()
	}, [])

	const onSubmit = async (data: any) => {
		await sendData(async () => {
			resetState()
			router.push(`/${locale}/dashboard/main`)
		})
	}

	useEffect(() => {
		const subscription = watch((value, { name }) => {
			if (!name) return
			const val = value[name as keyof typeof value]
			setField(name as keyof typeof value, val)
		})
		return () => subscription.unsubscribe()
	}, [watch])

	useEffect(() => {
		setField('phone', phone)
	}, [phone, setField])

	return (
		<div className={s.wrapper}>
			<div className={s.inner}>
				<div className={s.top}>
					<h1 className={s.title}>Регистрация</h1>
				</div>

				<form onSubmit={handleSubmit(onSubmit)}>
					<div className={`${s.phone} ${s.inputBox}`}>
						<label className={s.label}>Номер телефона</label>
						<Input
							{...register('phone')}
							value={formatPhoneNumber(phone)}
							placeholder={formatPhoneNumber(phone)}
							disabled
						/>
					</div>
					<div className={`${s.name} ${s.inputBox}`}>
						<label className={s.label}>{clientVariant ? 'Фамилия и Имя' : 'Укажите ФИО'}</label>
						<Input
							placeholder={clientVariant ? 'Укажите Имя и Фамилию' : 'Введите ФИО'}
							{...register('name', { required: 'Укажите имя и фамилию' })}
							hasError={!!errors.name}
						/>
						{errors.name && <p className={s.error}>{errors.name.message}</p>}
					</div>

					{lawyerVariant && (
						<div className={`${s.iin} ${s.inputBox}`}>
							<label className={s.label}>ИИН</label>
							<Input
								placeholder="Введите ИИН"
								// @ts-expect-error fix it
								{...register('iin', { required: 'Укажите ИИН' })}
								// @ts-expect-error fix it
								hasError={!!errors.iin}
							/>
							{/* @ts-expect-error fix it */}
							{errors.iin && <p className={s.error}>{errors.iin.message}</p>}
						</div>
					)}

					<div className={`${s.city} ${s.inputBox}`}>
						<label className={s.label}>Город</label>
						<Controller
							name="region_id"
							control={control}
							rules={{ required: 'Выберите регион или город' }}
							render={({ field }) => (
								<SearchSelect
									data={cities}
									loading={loadingCities}
									value={cities.find((city) => city.id === field.value)}
									onChange={(city) => field.onChange(city?.id)}
									getId={(item) => item.id}
									getLabel={(item) => (item?.type?.name === 'Область' ? `${item.name} (Область)` : item.name)}
									groupBy={(item) => (item?.type?.name === 'Город' ? item.path : null)}
									renderGroupLabel={(name) => <span>{name}</span>}
									placeholder="Выберите регион или город"
								/>
							)}
						/>

						{errors.region_id && <p className={s.error}>{errors.region_id.message}</p>}
					</div>

					{lawyerVariant && (
						<div className={`${s.specialization} ${s.inputBox}`}>
							<label className={s.label}>Ваша специальность</label>
							<Controller
								// @ts-expect-error fix it
								name="lawyer_type_id"
								control={control}
								rules={{ required: 'Выберите роль' }}
								render={({ field }) => (
									<SpecializationSelect
										data={specializations}
										loading={loadingSpecializations}
										value={field.value}
										onChange={(specialization) => field.onChange(specialization?.id)}
										getId={(item) => item.id}
										getLabel={(item) => (item?.type?.name === 'ХЗ' ? `${item.name} (ХЗ)` : item.name)}
										groupBy={(item) => (item?.type?.name === 'ХЗ' ? item.path : null)}
										renderGroupLabel={(name) => <span>{name}</span>}
										placeholder="Выберите роль"
									/>
								)}
							/>
							{/*  @ts-expect-error to fix */}
							{errors.lawyer_type_id && <p className={s.error}>{errors.lawyer_type_id.message}</p>}
						</div>
					)}

					<div className={`${s.password} ${s.inputBox}`}>
						<label className={s.label}>Пароль</label>
						<Input
							type="password"
							placeholder="Введите пароль"
							{...register('password')}
							hasError={!!errors.password}
						/>
						<p className={`${s.descr} ${errors.password ? s.descrError : ''}`}>
							Пароль должен состоять минимум из 8 символов, содержать 1 строчную (a-z), 1 заглавную букву (A-Z), цифры и
							специальные символы (! ? $ % *)
						</p>
					</div>
					<div className={`${s.password_confirmation} ${s.inputBox}`}>
						<label className={s.label}>Повторите пароль</label>
						<Input
							type="password"
							placeholder="Повторите пароль"
							{...register('password_confirmation')}
							hasError={!!errors.password_confirmation}
						/>
						{errors.password_confirmation && <p className={s.error}>{errors.password_confirmation.message}</p>}
					</div>

					<div className={s.submit}>
						<Button
							className={s.btn}
							size={'full'}
							type="submit"
							disabled={loading}>
							{loading ? 'Отправляется...' : 'Зарегистрироваться'}
						</Button>
					</div>
				</form>

				<div className={s.warning}>
					<p>Продолжая, вы соглашаетесь с</p>
					<Link
						target={'_blank'}
						href={'/policy'}>
						Политикой конфиденциальности
					</Link>
				</div>
			</div>
		</div>
	)
}
