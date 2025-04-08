'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

import { useEnterPhone } from '@/features/auth/register'
import { Input, Button } from '@/shared/ui-kit'

import { useNewPassword } from '../../model/resetPasswordStore'
import s from './EnterNewPasswordStep.module.scss'

export const EnterNewPasswordStep = () => {
	const { locale } = useParams()
	const router = useRouter()

	const phone = useEnterPhone((s) => s.phone)

	const { password, passwordConfirmation, loading, error, setPassword, setPasswordConfirmation, saveNewPassword } =
		useNewPassword()

	useEffect(() => {
		if (!phone) {
			router.replace(`/${locale}/auth/reset-password`)
		}
	}, [phone, locale, router])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		await saveNewPassword(() => {
			router.push(`/${locale}/auth/login`)
		})
	}

	return (
		<div className={s.wrapper}>
			<div className={s.inner}>
				<div className={s.top}>
					<h1 className={s.title}>Новый пароль</h1>
				</div>

				<form
					className={s.form}
					onSubmit={handleSubmit}>
					<div className={`${s.password} ${s.inputBox}`}>
						<label className={s.label}>Пароль</label>
						<Input
							type="password"
							placeholder="Введите пароль"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							hasError={!!error && !password}
						/>
					</div>

					<div className={`${s.password_confirmation} ${s.inputBox}`}>
						<label className={s.label}>Повторите пароль</label>
						<Input
							type="password"
							placeholder="Повторите пароль"
							value={passwordConfirmation}
							onChange={(e) => setPasswordConfirmation(e.target.value)}
							hasError={!!error && password !== passwordConfirmation}
						/>

						<p className={s.descr}>
							Пароль должен состоять минимум из 6 символов, содержать 1 строчную (a-z), 1 заглавную букву (A-Z), цифры и
							специальные символы (! ? $ % *)
						</p>
					</div>

					{error && <p className={s.error}>{error}</p>}

					<Button
						className={s.btn}
						variant="primary"
						size="full"
						type="submit"
						disabled={loading}>
						{loading ? 'Сохраняем...' : 'Сменить пароль'}
					</Button>
				</form>
			</div>
		</div>
	)
}
