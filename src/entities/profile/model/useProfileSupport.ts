import { create } from 'zustand'

import { profileApi } from '@/shared/api'

interface ProfileSupportState {
	phone_number: string | null
	fetchSupportNumber: () => Promise<SupportContact>
}

interface SupportContact {
	title: string
	code: string
	value: string
}

export const useProfileSupport = create<ProfileSupportState>((set) => ({
	phone_number: null,

	fetchSupportNumber: async () => {
		try {
			const contact = (await profileApi.getSupportContacts()) as SupportContact

			set({ phone_number: contact.value })
			console.log(contact)

			return contact
		} catch (error) {
			console.error(error)
			return null
		}
	},
}))
