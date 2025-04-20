'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useRouter, useParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { IMaskInput } from 'react-imask'

import { authApi, Button, Input, loginSchema, LoginSchemaType } from '@/shared'
import { useLoginStore } from '@/features/auth/login/model'

import s from './Login.module.scss'
import { useEnterPhone } from '@/features/auth/register'

export const Login = () => {
	const { locale } = useParams()
	const router = useRouter()
	const { login, loading, personalData, getPersonalDataByToken } = useLoginStore()
	const [formError, setFormError] = useState<string | null>(null)
	const { setPhone } = useEnterPhone()

	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<LoginSchemaType>({
		resolver: zodResolver(loginSchema),
		mode: 'onChange',
	})

	const onSubmit = async (data: LoginSchemaType) => {
		setFormError(null)

		try {
			const rawPhone = data.phone.replace(/\D/g, '')

			await login({
				phone: rawPhone,
				password: data.password,
			})

			const personalData = await authApi.me()
			// @ts-expect-error fix it
			const currentRole = personalData.role_id.code

			router.push(`/${locale}/dashboard/${currentRole}`)
		} catch (error: any) {
			setFormError(error.message)
		}
	}

	return (
		<div className={s.wrapper}>
			<div className={s.inner}>
				<div className={s.top}>
					<h1 className={s.title}>
						Войти
						<br /> в приложение
					</h1>
				</div>

				<form onSubmit={handleSubmit(onSubmit)}>
					<div className={`${s.phone} ${s.inputBox}`}>
						<label className={s.label}>Номер телефона</label>

						<Controller
							name="phone"
							control={control}
							render={({ field: { onChange, onBlur, value, ref } }) => (
								<Input
									type="tel"
									placeholder="Введите номер телефона"
									hasError={!!errors.phone}
									disabled={loading}
									// @ts-expect-error fix it
									as={IMaskInput}
									mask="+{7} (000) 000-00-00"
									value={value}
									onAccept={(phone: string) => {
										onChange(phone)
										setPhone(phone)
									}}
									onBlur={onBlur}
									inputRef={ref}
									unmask={true}
								/>
							)}
						/>
						{errors.phone && <p className={s.error}>{errors.phone.message}</p>}
					</div>

					<div className={`${s.password} ${s.inputBox}`}>
						<label className={s.label}>Пароль</label>
						<Input
							type="password"
							placeholder="Введите пароль"
							{...register('password')}
							hasError={!!errors.password}
						/>
						{errors.password && <p className={s.error}>{errors.password.message}</p>}
					</div>

					{formError && <p className={s.error}>{formError}</p>}

					<Link
						href={`/${locale}/auth/reset-password`}
						className={s.forgetPassword}>
						Забыли пароль?
					</Link>

					<Button
						className={s.btn}
						size="full"
						type="submit"
						disabled={loading}>
						{loading ? 'Входим...' : 'Войти'}
					</Button>
				</form>

				<Link
					className={s.link}
					href={`/${locale}/auth/register/select-role`}>
					Регистрация
				</Link>
			</div>
		</div>
	)
}
