'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

import { Input, Button } from '@/shared/ui-kit'
import { useEnterPhone } from '@/features/auth/register'

import s from './EnterNewPasswordStep.module.scss'
import { useNewPasswordStore } from '../../model/resetPasswordStore'

export const EnterNewPasswordStep = () => {
	const { locale } = useParams()
	const router = useRouter()
	const phone = useEnterPhone((s) => s.phone)

	const { password, password_confirmation, setField, submit, checkPhoneExist, errors, isSubmitting, success } =
		useNewPasswordStore()

	useEffect(() => {
		checkPhoneExist(phone, String(locale))
	}, [phone, locale])

	useEffect(() => {
		if (success) {
			router.push(`/${locale}/auth/login`)
		}
	}, [success, locale, router])

	return (
		<div className={s.wrapper}>
			<div className={s.inner}>
				<div className={s.top}>
					<h1 className={s.title}>Новый пароль</h1>
				</div>

				<form
					className={s.form}
					onSubmit={(e) => {
						e.preventDefault()
						submit()
					}}>
					<div className={`${s.password} ${s.inputBox}`}>
						<label className={s.label}>Пароль</label>
						<Input
							type="password"
							placeholder="Введите пароль"
							value={password}
							onChange={(e) => setField('password', e.target.value)}
							hasError={!!errors.password}
						/>
					</div>

					<div className={`${s.password_confirmation} ${s.inputBox}`}>
						<label className={s.label}>Повторите пароль</label>
						<Input
							type="password"
							placeholder="Повторите пароль"
							value={password_confirmation}
							onChange={(e) => setField('password_confirmation', e.target.value)}
							hasError={!!errors.password_confirmation}
						/>
						{errors.password_confirmation && <p className={s.error}>{errors.password_confirmation}</p>}
						<p className={`${s.descr} ${errors.password ? s.descrError : ''}`}>
							Пароль должен состоять минимум из 6 символов, содержать 1 строчную (a-z), 1 заглавную букву (A-Z), цифры и
							специальные символы (! ? $ % *)
						</p>
					</div>

					<Button
						className={s.btn}
						variant="primary"
						size="full"
						type="submit"
						disabled={isSubmitting}>
						{isSubmitting ? 'Сохраняем...' : 'Сменить пароль'}
					</Button>
				</form>
			</div>
		</div>
	)
}
