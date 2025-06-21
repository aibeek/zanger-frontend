import { sharedApi } from '@/shared/api'
import useSWR from 'swr'
import { create } from 'zustand'

export interface NotificationItem {
	id: number
	title: string
	is_read: boolean
	created_at: string
	image?: string
	hasButton: boolean
	buttonText: string
	buttonLink: string
	name: string
	type: string
}
type NotificationsStore = {
	notifications: NotificationItem[]
	setNotifications: (data: NotificationItem[]) => void
	markAsRead: (id: number) => void
	markAllAsRead: () => void
	clearAll: () => void
}

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
	notifications: [],
	setNotifications: (data) => set({ notifications: data }),
	markAsRead: (id: number) => {
		set((state) => ({
			notifications: state.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
		}))
		sharedApi.setReadNotification({}, id).catch(() => {})
	},
	markAllAsRead: () => {
		const { notifications } = get()
		set({
			notifications: notifications.map((n) => ({ ...n, is_read: true })),
		})
		notifications.forEach((n) => {
			if (!n.is_read) {
				sharedApi.setReadNotification({}, n.id).catch(() => {})
			}
		})
	},
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
