'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'

import { Button, Input } from '@/shared/ui-kit'
import lock from '@/app/assets/icons/lock.svg'

import s from './ProfileChangePassword.module.scss'
import { ProfileTabWrapper } from '../ProfileTabWrapper/ProfileTabWrapper'
import { useUpdatePasswordStore } from '../../model'

export const ProfileChangePassword = () => {
	const disclosureBtnRef = useRef<HTMLButtonElement>(null)
	const t = useTranslations()
	const { old_password, password, password_confirmation, setField, submit, errors, isSubmitting, reset } =
		useUpdatePasswordStore()

	return (
		<ProfileTabWrapper
			title={t('profile.change_password.title')}
			imgSrc={lock}
			imgAlt="lock"
			panel_title={t('profile.change_password.panelTitle')}
			panel_descr={t('profile.change_password.panelDescription')}
			ref={disclosureBtnRef}>
			<form
				className={s.form}
				onSubmit={(e) => {
					e.preventDefault()
					submit()
				}}>
				<div className={`${s.oldPassword} ${s.inputBox}`}>
					<label className={s.label}>{t('profile.change_password.oldPasswordLabel')}</label>
					<Input
						type="password"
						placeholder={t('profile.change_password.oldPasswordPlaceholder')}
						value={old_password}
						onChange={(e) => setField('old_password', e.target.value)}
						hasError={!!errors.old_password}
					/>
					{errors.old_password && <p className={s.error}>{t(errors.old_password)}</p>}
				</div>
				<div className={`${s.password} ${s.inputBox}`}>
					<label className={s.label}>{t('profile.change_password.newPasswordLabel')}</label>
					<Input
						type="password"
						placeholder={t('profile.change_password.newPasswordPlaceholder')}
						value={password}
						onChange={(e) => setField('password', e.target.value)}
						hasError={!!errors.password}
					/>
					{errors.password && <p className={s.error}>{t(errors.password)}</p>}
				</div>

				<div className={`${s.password_confirmation} ${s.inputBox}`}>
					<label className={s.label}>{t('profile.change_password.repeatPasswordLabel')}</label>
					<Input
						type="password"
						placeholder={t('profile.change_password.repeatPasswordPlaceholder')}
						value={password_confirmation}
						onChange={(e) => setField('password_confirmation', e.target.value)}
						hasError={!!errors.password_confirmation}
					/>
					{errors.password_confirmation && <p className={s.error}>{t(errors.password_confirmation)}</p>}
					<p className={`${s.warning} ${errors.password ? s.warningError : ''}`}>
						{t('profile.change_password.passwordWarning')}
						<span>{t('profile.change_password.passwordConditions')}</span>
					</p>
				</div>

				<div className={s.btns}>
					<Button
						style={{ padding: '8px 30px' }}
						variant="primary"
						size="auto"
						type="submit"
						disabled={isSubmitting}>
						{isSubmitting ? t('profile.change_password.saving') : t('profile.change_password.save')}
					</Button>
					<Button
						onClick={() => {
							reset()
							disclosureBtnRef.current?.click()
						}}
						variant="border"
						size="auto"
						disabled={isSubmitting}>
						{t('profile.change_password.cancel')}
					</Button>
				</div>
			</form>
		</ProfileTabWrapper>
	)
}
