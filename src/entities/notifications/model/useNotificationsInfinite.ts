import useSWRInfinite from 'swr/infinite'
import { sharedApi } from '@/shared/api'
import { PAGE_SIZE } from '@/shared/lib'
import { useNotificationsStore, type NotificationItem } from './useNotificationsStore'

const fetcher = async (key: string): Promise<NotificationItem[]> => {
	const urlParams = new URLSearchParams(key.split('?')[1])
	const page = Number(urlParams.get('page')) || 1

	const response = await sharedApi.getAllNotifications({
		page: page,
		per_page: PAGE_SIZE,
	})

	// Normalize to array; backend returns { data: T[] }
	// If response shape differs, fallback to empty array to keep SWR stable
	const data = (response as any)?.data
	return Array.isArray(data) ? (data as NotificationItem[]) : []
}

export const useNotificationsInfinite = () => {
	const { setNotifications } = useNotificationsStore()

	const getKey = (pageIndex: number, previousPageData: any) => {
		if (previousPageData && previousPageData.length < PAGE_SIZE) return null

		const page = pageIndex + 1
		const params = new URLSearchParams({
			page: String(page),
		})

		return `/notifications/all?${params.toString()}`
	}

	const { data, error, size, setSize, mutate } = useSWRInfinite(getKey, fetcher, {
		onSuccess: (allPages) => {
			// Guard against unexpected shapes from the fetcher
			const pages = Array.isArray(allPages) ? allPages : []
			const flat = pages.flat()
			setNotifications(flat)
		},
	})

	const items = Array.isArray(data) ? data.flat() : []
	const isLoadingInitialData = !data && !error
	const lastPage = Array.isArray(data) ? data[data.length - 1] : undefined
	const isLoadingMore = isLoadingInitialData || (size > 0 && typeof lastPage === 'undefined')
	const isReachingEnd = Array.isArray(lastPage) ? lastPage.length < PAGE_SIZE : false

	return { items, error, isLoadingMore, setSize, size, isReachingEnd, mutate }
}
