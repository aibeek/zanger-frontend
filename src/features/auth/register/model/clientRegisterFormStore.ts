import { create } from 'zustand'

import { authApi, ClientRegisterDto } from '@/shared/api'

interface ClientRegisterFormStore {
	data: ClientRegisterDto
	loading: boolean
	setField: <K extends keyof ClientRegisterDto>(key: K, value: ClientRegisterDto[K]) => void
	sendData: (onSuccess: () => Promise<void>) => Promise<void>
	resetState: () => void
}

export const useClientRegisterForm = create<ClientRegisterFormStore>((set, get) => ({
	data: {
		name: '',
		email: '',
		phone: '',
		password: '',
		password_confirmation: '',
		region_id: 0,
		language: 'ru',
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
			await authApi.registerClient(data)
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
			},
		}),
}))
