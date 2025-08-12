import { create } from 'zustand'
import { lawyerApi, SubscriptionPlanRaw } from '@/shared/api'

interface SubscriptionPlan {
	planId: number
	value: string
	label: string
	description: string
	price: string
}

interface SubscriptionState {
	planId: number
	isAutoRenew: boolean
	plans: SubscriptionPlan[]
	loading: boolean
	setPlanId: (id: number) => void
	setAutoRenew: (val: boolean) => void
	fetchPlans: () => Promise<void>
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
	planId: 0,
	isAutoRenew: false,
	plans: [],
	loading: false,

	setPlanId: (id) => set({ planId: id }),
	setAutoRenew: (val) => set({ isAutoRenew: val }),

	fetchPlans: async () => {
		set({ loading: true })
		try {
			const response = (await lawyerApi.getAllSubscriptionPlans()) as { data: SubscriptionPlanRaw[] }

			// Фильтруем тестовые планы
			const filteredPlans = response.data.filter((plan) => {
				const price = Number(plan.price)
				const isTestPlan = plan.name.toLowerCase().includes('тест') || price === 25
				return !isTestPlan
			})

			const mappedPlans: SubscriptionPlan[] = filteredPlans.map((plan) => ({
				planId: plan.id,
				value: `plan-${plan.id}`,
				label: plan.name,
				description: plan.description ?? '',
				price: `${Number(plan.price).toLocaleString()} ₸`,
			}))

			set({ plans: mappedPlans, loading: false })
		} catch (error) {
			console.error('Ошибка загрузки планов подписки:', error)
			set({ loading: false })
		}
	},
}))
