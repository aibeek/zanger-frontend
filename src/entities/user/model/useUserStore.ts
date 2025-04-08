import { create } from 'zustand'

type User = {
	name: string
	phone: string
	password: string
	password_confirmation: string
	region_id: number
	language: string
	iin?: number
	lawyer_type_id?: number
}

type UserStore = {
	user: User | null
	setUser: (user: User) => void
}

export const useUserStore = create<UserStore>((set) => ({
	user: null,
	setUser: (user) => set({ user }),
}))
