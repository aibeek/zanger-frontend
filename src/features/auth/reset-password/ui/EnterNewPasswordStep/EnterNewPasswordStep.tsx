'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { Input, Button } from '@/shared/ui-kit'
import { useEnterPhone, useNewPasswordStore } from '@/features/auth'

import s from './EnterNewPasswordStep.module.scss'
import { useTranslations } from 'next-intl'

export const EnterNewPasswordStep = () => {
	const router = useRouter()
	const phone = useEnterPhone((s) => s.phone)
	const t = useTranslations()
	const { password, password_confirmation, setField, submit, checkPhoneExist, errors, isSubmitting, success } =
		useNewPasswordStore()

	useEffect(() => {
		checkPhoneExist(phone)
	}, [phone])

	useEffect(() => {
		if (success) {
			router.push(`/auth/login`)
		}
	}, [success, router])

	return (
		<div className={s.wrapper}>
			<div className={s.inner}>
				<div className={s.top}>
					<h1 className={s.title}>{t('auth.enterNewPassword.newPassword')}</h1>
				</div>

				<form
					className={s.form}
					onSubmit={(e) => {
						e.preventDefault()
						submit()
					}}>
					<div className={`${s.password} ${s.inputBox}`}>
						<label className={s.label}>{t('auth.enterNewPassword.password')}</label>
						<Input
							autoFocus
							type="password"
							placeholder={t('auth.enterNewPassword.passwordPlaceholder')}
							value={password}
							onChange={(e) => setField('password', e.target.value)}
							hasError={!!errors.password}
						/>
					</div>

					<div className={`${s.password_confirmation} ${s.inputBox}`}>
						<label className={s.label}>{t('auth.enterNewPassword.passwordConfirmation')}</label>
						<Input
							type="password"
							placeholder={t('auth.enterNewPassword.passwordConfirmationPlaceholder')}
							value={password_confirmation}
							onChange={(e) => setField('password_confirmation', e.target.value)}
							hasError={!!errors.password_confirmation}
						/>
						{errors.password_confirmation && <p className={s.error}>{t(errors.password_confirmation)}</p>}
						<p className={`${s.descr} ${errors.password ? s.descrError : ''}`}>
							{t('auth.enterNewPassword.passwordDesc')}
						</p>
					</div>

					<Button
						className={s.btn}
						variant="primary"
						size="full"
						type="submit"
						disabled={isSubmitting}>
						{isSubmitting ? t('auth.enterNewPassword.saving') : t('auth.enterNewPassword.changePassword')}
					</Button>
				</form>
			</div>
		</div>
	)
}
