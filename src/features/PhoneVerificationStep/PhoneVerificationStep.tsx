import { Button } from '@/shared/ui-kit'
import { useRequestTimer, useStepMarcher } from '@/shared/lib'
import { authApi, PhoneAuthVariant } from '@/shared/api'
import { InputOTPPattern } from '@/shared/ui-kit'

import s from './PhoneVerificationStep.module.scss'
import { useEnterPhone, useVerifyCode } from '../auth/register'

type Props = {
	variant: PhoneAuthVariant
}

export const PhoneVerificationStep = ({ variant }: Props) => {
	const { phone } = useEnterPhone()
	const { nextStep } = useStepMarcher()
	const { code, error, setCode, validateCode } = useVerifyCode()

	const {
		hasRequested,
		secondsLeft: cd,
		isFinished,
		request,
	} = useRequestTimer(60, async () => {
		await authApi.sendPhone({ phone }, variant as PhoneAuthVariant)
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
			validateCode(phone, nextStep, variant, (res) => (variant === 'reset-password' ? true : res.success === true))
		}
	}

	return (
		<div className={s.wrapper}>
			<div className={s.inner}>
				<div className={s.top}>
					<h1 className={s.title}>Введите код</h1>
					<div className={s.descr}>
						<p className={s.descrText}>
							Мы отправили СМС с кодом на номер
							<span className={s.phone}>{phone}</span>
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
						{error && <p className={s.error}>{error}</p>}
					</label>
				</form>
				<div className={s.getNewCode}>
					{hasRequested && !isFinished && (
						<p>
							Получить новый код можно через <span className={s.timer}>{cd}</span> сек
						</p>
					)}
					{(!hasRequested || isFinished) && (
						<Button
							className={s.btn}
							variant="clear"
							size="auto"
							onClick={request}>
							Отправить код еще раз
						</Button>
					)}
				</div>
			</div>
		</div>
	)
}
