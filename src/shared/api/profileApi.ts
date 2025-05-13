import { API_URL } from '../config'
import { httpClientWithAuth } from './httpClient'

export type UpdateClientData = {
	lawyer_type_id: number
	name: string
	phone: string
	telegram: string
	whatsapp: string
	iin: string
	region_id: number
}

export type UpdatePasswordDto = {
	old_password: string
	password: string
	password_confirmation: string
}

export type UpdateAvatarDto = {
	avatar: File | Blob
}

export type UpdateLanguageDto = {
	language: 'ru' | 'en' | 'kz'
}

export type UpdateRegionDto = {
	region_id: number
}

export const profileApi = {
	updatePassword: (data: UpdatePasswordDto) =>
		httpClientWithAuth(`${API_URL}/profile/password`, {
			method: 'PUT',
			body: JSON.stringify(data),
		}),

	updateAvatar: (data: UpdateAvatarDto) =>
		httpClientWithAuth(`${API_URL}/profile/icon`, {
			method: 'PATCH',
			body: JSON.stringify(data),
		}),

	updateLanguage: (data: UpdateLanguageDto) =>
		httpClientWithAuth(`${API_URL}/profile/language`, {
			method: 'PATCH',
			body: JSON.stringify(data),
		}),

	updateRegion: (data: UpdateRegionDto) =>
		httpClientWithAuth(`${API_URL}/profile/region`, {
			method: 'PATCH',
			body: JSON.stringify(data),
		}),

	updateProfilePersonalData: (data: UpdateClientData) =>
		httpClientWithAuth(`${API_URL}/profile/clinets/`, {
			method: 'PUT',
			body: JSON.stringify(data),
		}),
}
