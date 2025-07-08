import { sharedApi } from '@/shared/api'
import toast from 'react-hot-toast'
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
	cancel_reason?: string
}

type NotificationsStore = {
	notifications: NotificationItem[]
	setNotifications: (data: NotificationItem[]) => void
	markAsRead: (id: number) => void
}

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
	notifications: [],

	setNotifications: (newData) =>
		set((state) => {
			const existingIds = new Set(state.notifications.map((n) => n.id))
			const merged = [...state.notifications]

			for (const item of newData) {
				if (!existingIds.has(item.id)) {
					merged.push(item)
				}
			}
			return { notifications: merged }
		}),

	markAsRead: (id: number) => {
		set((state) => ({
			notifications: state.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
		}))
		sharedApi.setReadNotification({}, id).catch(() => {})
	},
}))
