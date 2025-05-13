import { API_URL } from '../config'
import { tokenService } from './tokenService'
import { httpClient, httpClientWithAuth } from './httpClient'

export interface LoginDto {
	phone: string
	password: string
}

export interface SendSmsCodeDto {
	phone: string
}

export interface ValidateCodeDto extends SendSmsCodeDto {
	code: number
}

export interface ClientRegisterDto {
	name: string
	phone: string
	password: string
	password_confirmation: string
	region_id: number
	language: string
}

export interface LawyerRegisterDto extends ClientRegisterDto {
	iin: string
	lawyer_type_id: number
}

export type RegisterDto = ClientRegisterDto | ((LawyerRegisterDto & { role: 'lawyer' }) & { role: 'client' })

export type PhoneAuthVariant = 'reset-password' | 'register'

export const authApi = {
	sendPhone: (data: SendSmsCodeDto, variant: PhoneAuthVariant) =>
		httpClient(`${API_URL}/${variant === 'reset-password' ? 'password/' : ''}send-sms-code`, {
			method: 'POST',
			body: JSON.stringify(data),
		}),

	verifyCode: (data: ValidateCodeDto, variant: PhoneAuthVariant) =>
		httpClient(`${API_URL}/${variant === 'reset-password' ? 'password/' : ''}validate-code`, {
			method: 'POST',
			body: JSON.stringify(data),
		}),

	registerLawyer: (data: LawyerRegisterDto) =>
		httpClient(`${API_URL}/lawyer/sign-up`, {
			method: 'POST',
			body: JSON.stringify(data),
		}),

	registerClient: (data: ClientRegisterDto) =>
		httpClient(`${API_URL}/client/sign-up`, {
			method: 'POST',
			body: JSON.stringify(data),
		}),

	login: async (data: LoginDto) => {
		const res = await httpClient(`${API_URL}/auth/login`, {
			method: 'POST',
			body: JSON.stringify(data),
		})
		// @ts-expect-error to fix
		tokenService.saveToken(res)
		return res
	},

	me: () =>
		httpClientWithAuth(`${API_URL}/auth/me`, {
			method: 'GET',
		}),

	updatePassword: (data: { password: string; password_confirmation: string }) =>
		httpClientWithAuth(`${API_URL}/password/update`, {
			method: 'POST',
			body: JSON.stringify(data),
		}),
}
