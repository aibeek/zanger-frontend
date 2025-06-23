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
}

type NotificationsStore = {
	notifications: NotificationItem[]
	setNotifications: (data: NotificationItem[]) => void
	markAsRead: (id: number) => void
	markAllAsRead: () => void
	hiddenIds: number[]
	clearAll: (t: (key: string) => string) => void
}

const getHiddenIdsFromStorage = (): number[] => {
	if (typeof window === 'undefined') return []
	const raw = localStorage.getItem(HIDDEN_IDS_KEY)
	try {
		return raw ? JSON.parse(raw) : []
	} catch {
		return []
	}
}

const setHiddenIdsToStorage = (ids: number[]) => {
	localStorage.setItem(HIDDEN_IDS_KEY, JSON.stringify(ids))
}

const HIDDEN_IDS_KEY = 'hidden_notification_ids'

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
	notifications: [],
	hiddenIds: getHiddenIdsFromStorage(),

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
	clearAll: (t) => {
		const allIds = get().notifications.map((n) => n.id)
		set({ notifications: [], hiddenIds: allIds })
		setHiddenIdsToStorage(allIds)
		toast.success(t('cleared'))
	},
}))

export const useNotifications = () => {
	const { setNotifications } = useNotificationsStore()

	const { data, error, isLoading, mutate } = useSWR(
		'/notifications/all',
		async () => {
			const res = await sharedApi.getAllNotifications()
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
