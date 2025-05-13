import { create } from 'zustand'

import { authApi, PhoneAuthVariant, tokenService } from '@/shared/api'

interface verifyCodeStore {
	code: string
	loading: boolean
	error: string | null
	setCode: (code: string) => void
	validateCode: (
		phone: string,
		onSuccess: () => void,
		variant?: PhoneAuthVariant,
		onSuccessCondition?: (res: any) => boolean,
	) => Promise<void>
}

export const useVerifyCode = create<verifyCodeStore>((set) => ({
	code: '',
	loading: false,
	error: null,

	setCode: (code: string) => set({ code, error: null }),

	validateCode: async (phone, onSuccess, variant, onSuccessCondition = (res: any) => res.success === true) => {
		const { code } = useVerifyCode.getState()

		if (!code) {
			set({ error: 'Enter code' })
			return
		}

		set({ loading: true, error: null })

		try {
			const res = await authApi.verifyCode({ phone, code: Number(code) }, variant)

			// @ts-expect-error to fix
			if (res.access_token && res.expires_in) {
				tokenService.saveToken({
					// @ts-expect-error to fix
					access_token: res.access_token,
					// @ts-expect-error to fix
					expires_in: res.expires_in,
				})
			}

			if (onSuccessCondition(res)) {
				onSuccess()
			} else {
				set({ error: 'Invalid code' })
			}
		} catch (e) {
			console.error(e)
			set({ error: 'Invalid code' })
		} finally {
			set({ loading: false })
		}
	},
}))
