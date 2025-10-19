import { create } from 'zustand'

import { LawyerRegisterDto, authApi } from '@/shared/api'

interface LawyerRegisterFormStore {
	data: LawyerRegisterDto
	loading: boolean
	setField: <K extends keyof LawyerRegisterDto>(key: K, value: LawyerRegisterDto[K]) => void
	sendData: (onSuccess: () => Promise<void>) => Promise<void>
	resetState: () => void
}

export const useLawyerRegisterForm = create<LawyerRegisterFormStore>((set, get) => ({
	data: {
		name: '',
		email: '',
		phone: '',
		password: '',
		password_confirmation: '',
		region_id: 0,
		language: 'ru',
		iin: '',
		lawyer_type_id: 0,
	},

	loading: false,
	loadingCities: false,

	setField: (key, value) => {
		set((state) => ({
			data: {
				...state.data,
				[key]: value,
			},
		}))
	},

	sendData: async (onSuccess: () => Promise<void>) => {
		const data = get().data
		set({ loading: true })

		try {
			await authApi.registerLawyer(data)
			await onSuccess()
		} catch (e) {
			console.log(e)
		} finally {
			set({ loading: false })
		}
	},

	resetState: () =>
		set({
			data: {
				name: '',
				email: '',
				phone: '',
				password: '',
				password_confirmation: '',
				region_id: 0,
				language: 'ru',
				iin: '',
				lawyer_type_id: 0,
			},
		}),
}))
