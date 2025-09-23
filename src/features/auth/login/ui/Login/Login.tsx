'use client'

import Link from 'next/link'
import { IMaskInput } from 'react-imask'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

import { Button, Input } from '@/shared/ui-kit'
import { useEnterPhone, useLoginStore } from '@/features/auth'
import {
	defaultClientTab,
	defaultLawyerTab,
	loginSchema,
	LoginSchemaType,
	RoleVariant,
	useBrowserLang,
} from '@/shared/lib'

import s from './Login.module.scss'

export const Login = () => {
	const router = useRouter()
	const { login, loading, personalData } = useLoginStore()
	const [formError, setFormError] = useState<string | null>(null)
	const { setPhone } = useEnterPhone()
	const locale = useBrowserLang()
	const t = useTranslations()

	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<LoginSchemaType>({
		resolver: zodResolver(loginSchema),
		mode: 'onChange',
	})

	useEffect(() => {
		if (!personalData) return

		const role = personalData?.role_id.code as RoleVariant

		if (role === 'client') {
			router.push(`/${locale}/${defaultClientTab}`)
		}
		if (role === 'lawyer') {
			router.push(`/${locale}/${defaultLawyerTab}`)
		}
	}, [personalData, router])

	const onSubmit = async (data: LoginSchemaType) => {
		setFormError(null)

		try {
			const rawPhone = data.phone.replace(/\D/g, '')
			await login({ phone: rawPhone, password: data.password })
		} catch (error: any) {
			setFormError(error.message)
		}
	}

	return (
		<div className={s.wrapper}>
			<div className={s.inner}>
				<div className={s.top}>
					{/* Бренд по центру, как в дизайне */}
					<div className={s.brand}>
						<Image src="/logo.svg" alt="Zanger" width={28} height={28} />
						<span>ZANGER</span>
					</div>
					<h1
						className={s.title}
						dangerouslySetInnerHTML={{ __html: t('auth.login.title') }}
					/>
				</div>

				<form onSubmit={handleSubmit(onSubmit)}>
					<div className={`${s.phone} ${s.inputBox}`}>
						<label className={s.label}>{t('auth.login.phoneLabel')}</label>

						<Controller
							name="phone"
							control={control}
							render={({ field: { onChange, onBlur, value, ref } }) => (
								<Input
									autoFocus
									type="tel"
									placeholder={t('auth.login.phonePlaceholder')}
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
						{errors.phone && <p className={s.error}>{t(errors.phone.message || 'validation.generic')}</p>}
					</div>

					<div className={`${s.password} ${s.inputBox}`}>
						<label className={s.label}>{t('auth.login.passwordLabel')}</label>
						<Input
							type="password"
							placeholder={t('auth.login.passwordPlaceholder')}
							{...register('password')}
							hasError={!!errors.password}
							disabled={loading}
						/>
						{errors.password && <p className={s.error}>{t(errors.password.message)}</p>}
					</div>

					{formError && <p className={s.error}>{formError}</p>}

					<Link
						href={`/auth/reset-password`}
						className={s.forgetPassword}>
						{t('auth.login.forgotPassword')}
					</Link>

					<Button
						className={s.btn}
						size="full"
						type="submit"
						disabled={loading}>
						{loading ? t('auth.login.submitting') : t('auth.login.submit')}
					</Button>
				</form>

				<div className={s.disclaimer}>
					<span>
						Авторизуясь, Вы подтверждаете, что ознакомились и принимаете{' '}
						<Link className={s.link} href="#">Политику конфиденциальности</Link>
						{' '}и{' '}
						<Link className={s.link} href="#">Публичную оферту</Link>
					</span>
				</div>
			</div>
		</div>
	)
}
