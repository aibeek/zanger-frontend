'use client'

import { authApi, PhoneAuthVariant } from '@/shared/api'
import { InputOTPPattern, Button } from '@/shared/ui-kit'
import { useRequestTimer, useStepMarcher } from '@/shared/lib'
import { useEnterPhone, useVerifyCode } from '@/features/auth/register'
import { useTranslations } from 'next-intl'

import s from './PhoneVerificationStep.module.scss'
import { mapServerError } from '@/shared/lib/helpers/mapServerError'

type Props = {
	variant: PhoneAuthVariant
}

export const PhoneVerificationStep = ({ variant }: Props) => {
	const t = useTranslations()

	const { phone } = useEnterPhone()
	const { nextStep } = useStepMarcher()
	const { code, error, setCode, validateCode } = useVerifyCode()

	const {
		hasRequested,
		secondsLeft: cd,
		isFinished,
		request,
	} = useRequestTimer(60, async () => {
		await authApi.sendPhone({ phone }, variant)
	})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (code && code.length === 3) {
			await validateCode(phone, nextStep, variant, (res) =>
				variant === 'reset-password' ? true : res.success === true,
			)
		}
	}

	const handleCodeChange = (val: string) => {
		setCode(val)
		if (val.length === 3) {
			validateCode(phone, nextStep, variant, (res) =>
				variant === 'reset-password' ? true : res.success === true,
			)
		}
	}

	return (
		<div className={s.wrapper}>
			<div className={s.inner}>
				<div className={s.top}>
					<h1 className={s.title}>{t('auth.verifyCode.title')}</h1>
					<div className={s.descr}>
						<p className={s.descrText}>
							{t('auth.verifyCode.description')} <span className={s.phone}>{phone}</span>
						</p>
					</div>
				</div>

				<form
					onChange={handleSubmit}
					className={s.form}>
					<label className={s.label}>
						<InputOTPPattern
							// @ts-expect-error not sure how to fix
							value={code}
							onChange={handleCodeChange}
							hasError={!!error}
						/>
						{error && <p className={s.error}>{t(`errors.${mapServerError(error) || 'genericError'}`)}</p>}
					</label>
				</form>

				<div className={s.getNewCode}>
					{hasRequested && !isFinished && (
						<p>
							{t('auth.verifyCode.timerPrefix')} <span className={s.timer}>{cd}</span>{' '}
							{t('auth.verifyCode.timerSuffix')}
						</p>
					)}
					{(!hasRequested || isFinished) && (
						<Button
							className={s.btn}
							variant="clear"
							size="auto"
							onClick={request}>
							{t('auth.verifyCode.resend')}
						</Button>
					)}
				</div>
			</div>
		</div>
	)
}
