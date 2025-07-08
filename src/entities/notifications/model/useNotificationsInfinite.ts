// import useSWRInfinite from 'swr/infinite'
// import { sharedApi } from '@/shared/api'
// import { PAGE_SIZE } from '@/shared/lib'

// const fetcher = async (key: string) => {
// 	const urlParams = new URLSearchParams(key.split('?')[1])
// 	const page = Number(urlParams.get('page')) || 1

// 	const response = await sharedApi.getAllNotifications({
// 		page: page,
// 		per_page: PAGE_SIZE,
// 	})

// 	// @ts-expect-error fix it
// 	return response.data
// }

// export const useNotificationsInfinite = () => {
// 	const getKey = (pageIndex: number, previousPageData: any) => {
// 		if (previousPageData && previousPageData.length < PAGE_SIZE) return null

// 		const page = pageIndex + 1
// 		const params = new URLSearchParams({
// 			page: String(page),
// 		})

// 		return `/lawyers/notifications?${params.toString()}`
// 	}

// 	const { data, error, size, setSize, mutate } = useSWRInfinite(getKey, fetcher)

// 	const items = data ? data.flat() : []
// 	const isLoadingInitialData = !data && !error
// 	const isLoadingMore = isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === 'undefined')
// 	const isReachingEnd = data && data[data.length - 1]?.length < PAGE_SIZE

// 	return { items, error, isLoadingMore, setSize, size, isReachingEnd, mutate }
// }
