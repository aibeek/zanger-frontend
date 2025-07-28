import { create } from 'zustand'
import { lawyerApi } from '@/shared/api'
import { toast } from 'react-hot-toast'

interface Card {}

interface PaymentState {
	cards: Card[]
	loading: boolean
	error: string | null
}

interface PaymentActions {
	fetchCards: () => Promise<void>
	deleteCard: (id: number) => Promise<void>
	activateCard: (id: number) => Promise<void>
	addCard: () => any
}

export const usePaymentStore = create<PaymentState & PaymentActions>()((set, get) => ({
	cards: [],
	loading: false,
	error: null,

	fetchCards: async () => {
		set({ loading: true, error: null })
		try {
			const cards = await lawyerApi.getMyCards()
			// @ts-expect-error fix it
			set({ cards, loading: false })
		} catch (e: any) {
			set({ loading: false, error: e.message ?? 'Не удалось загрузить карты' })
			toast.error(get().error!)
		}
	},

	deleteCard: async (id: number) => {
		const toastId = toast.loading('Удаление карты…')
		try {
			await lawyerApi.deleteCardById(id)
			// @ts-expect-error fix it
			set((state) => ({ cards: state.cards.filter((card) => card.id !== id) }))
			toast.success('Карта удалена', { id: toastId })
		} catch (e: any) {
			set({ error: e.message ?? 'Ошибка при удалении' })
			toast.error(`Ошибка: ${get().error}`, { id: toastId })
		}
	},

	activateCard: async (id: number) => {
		const toastId = toast.loading('Активация карты…')
		try {
			await lawyerApi.toActiveMyCard(id)
			set((state) => ({
				// @ts-expect-error fix it
				cards: state.cards.map((card) => ({ ...card, isActive: card.id === id })),
			}))
			toast.success('Карта активирована', { id: toastId })
		} catch (e: any) {
			set({ error: e.message ?? 'Ошибка при активации' })
			toast.error(`Ошибка: ${get().error}`, { id: toastId })
		}
	},

	addCard: async () => {
		set({ loading: true, error: null })
		const toastId = toast.loading('Создание карты…')
		try {
			const result = await lawyerApi.addNewCard() // Card с optional redirect_url
			set((state) => ({ cards: [...state.cards, result], loading: false }))
			toast.success('Карта создана', { id: toastId })

			if (result.redirect_url && typeof result.redirect_url === 'string') {
				return result.redirect_url
			}
		} catch (e: any) {
			set({ loading: false, error: e.message ?? 'Не удалось создать карту' })
			toast.error(`Ошибка: ${get().error}`, { id: toastId })
		}
	},
}))
