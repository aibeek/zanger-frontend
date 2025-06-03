import { sharedApi } from '@/shared/api'
import useSWR from 'swr'
import { create } from 'zustand'

type Notification = {
	id: number
	title: string
	is_read: boolean
	created_at: string
	// добавь другие поля при необходимости
}

type NotificationsStore = {
	notifications: Notification[] | any
	setNotifications: (data: Notification[]) => void
	markAsRead: (id: number) => void
	clearAll: () => void
}

export const useNotificationsStore = create<NotificationsStore>((set) => ({
	notifications: [],
	setNotifications: (data) => set({ notifications: data }),
	markAsRead: (id) =>
		set((state) => ({
			notifications: state.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
		})),
	clearAll: () => set({ notifications: [] }),
}))

export const useNotifications = () => {
	const { setNotifications } = useNotificationsStore()

	const { data, error, isLoading, mutate } = useSWR(
		'/notifications',
		async () => {
			const res = await sharedApi.getNotifications()
			// @ts-expect-error fix it
			return res.data
		},
		{
			onSuccess: (data) => {
				setNotifications(data || [])
			},
		},
	)

	return {
		notifications: data || [],
		isLoading,
		error,
		mutate,
	}
}
