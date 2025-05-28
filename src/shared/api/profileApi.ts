import { API_URL } from '../config'
import { httpClientWithAuth } from './httpClient'

export type UpdateClientData = {
	name?: string
	phone?: string
	telegram?: string | null
	whatsapp?: string | null
	iin?: string
	lawyer_type_id?: number
	region_id?: number
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
	language: 'ru' | 'kz'
}

export type UpdateRegionDto = {
	region_id: number
}

export type UpdateConsultationPrice = {
	consultation_price: number
}

export type UpdateServicingRegions = {
	region_ids: number[]
}

export type LawyerDocument = {
	id: number
	id_to_delete: number
	name: string
	is_double_sided: boolean
	link: string
	status: {
		type: string
		title: string
	}
	sides: null
	is_uploaded: boolean
}

export const profileApi = {
	updatePassword: (data: UpdatePasswordDto) =>
		httpClientWithAuth(`${API_URL}/profile/password`, {
			method: 'PUT',
			body: JSON.stringify(data),
		}),

	updateAvatar: (data: { icon: string }) =>
		httpClientWithAuth(`${API_URL}/profile/icon`, {
			method: 'PATCH',
			body: JSON.stringify(data),
		}),

	setAvatar: (formData: FormData) =>
		httpClientWithAuth(`${API_URL}/file`, {
			method: 'POST',
			body: formData,
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

	updateProfilePersonalData: (data: UpdateClientData, role: string) => {
		const fixedRole = role === 'lawyer' ? 'lawyers' : 'clients'

		httpClientWithAuth(`${API_URL}/profile/${fixedRole}/`, {
			method: 'PUT',
			body: JSON.stringify(data),
		})
	},

	updateConsultationPrice: (data: UpdateConsultationPrice) =>
		httpClientWithAuth(`${API_URL}/profile/lawyers/consultation-price`, {
			method: 'PATCH',
			body: JSON.stringify(data),
		}),

	getSelectedLawyerSpecializations: () =>
		httpClientWithAuth(`${API_URL}/profile/lawyers/specializations`, {
			method: 'GET',
		}),

	updateLawyerSpecializations: (formData: FormData) =>
		httpClientWithAuth(`${API_URL}/profile/lawyers/specializations`, {
			method: 'POST',
			body: JSON.stringify(formData),
		}),

	getServicingRegions: () =>
		httpClientWithAuth(`${API_URL}/profile/lawyers/service-regions`, {
			method: 'GET',
		}),

	updateServicingRegions: (region: UpdateServicingRegions) =>
		httpClientWithAuth(`${API_URL}/profile/lawyers/service-regions`, {
			method: 'POST',
			body: JSON.stringify(region),
		}),

	myDocuments: () => {
		return httpClientWithAuth(`${API_URL}/profile/lawyers/documents`, {
			method: 'GET',
		})
	},

	uploadDocument: (formData: FormData) => {
		httpClientWithAuth(`${API_URL}/profile/lawyers/documents`, {
			method: 'POST',
			body: formData,
		})
	},

	deleteDocument: (id: number) =>
		httpClientWithAuth(`${API_URL}/profile/lawyers/documents/${id}`, {
			method: 'DELETE',
		}),
}
