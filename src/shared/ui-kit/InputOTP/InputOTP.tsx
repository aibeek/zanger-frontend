'use client'

import OtpInput from 'react-otp-input'

import { useVerifyCode } from '@/features/auth'

import { Input } from '../Input'

export const InputOTPPattern = ({ hasError }: { hasError: boolean }) => {
	const { code, setCode } = useVerifyCode()
	const handleChange = (val: string) => {
		setCode(val)
	}

	return (
		<OtpInput
			shouldAutoFocus={true}
			containerStyle={{ gap: '10px', justifyContent: 'center' }}
			value={code}
			onChange={handleChange}
			numInputs={4}
			inputType={'number'}
			renderInput={(props) => (
				<Input
					variant="otp"
					hasError={hasError}
					{...props}
				/>
			)}
		/>
	)
}
