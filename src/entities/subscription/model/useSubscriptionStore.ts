import { create } from 'zustand'

interface SubscriptionState {
	planId: number
	setPlanId: (id: number) => void
	isAutoRenew: boolean
	setAutoRenew: (val: boolean) => void
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
	planId: 0,
	isAutoRenew: false,
	setPlanId: (id) => set({ planId: id }),
	setAutoRenew: (val) => set({ isAutoRenew: val }),
}))
