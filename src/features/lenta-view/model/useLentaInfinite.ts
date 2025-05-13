import useSWRInfinite from 'swr/infinite'

import { lawyerApi } from '@/shared/api'
import { PAGE_SIZE } from '@/shared/lib'

const fetcher = async (key: string) => {
	const urlParams = new URLSearchParams(key.split('?')[1])
	const page = Number(urlParams.get('page')) || 1

	const response = await lawyerApi.getOrders({
		all_regions: 1,
		all_tags: 1,
		page: page,
		per_page: PAGE_SIZE,
	})

	// @ts-expect-error fix it
	return response.data
}

export const useLentaInfinite = () => {
	const getKey = (pageIndex: number, previousPageData: any) => {
		if (pageIndex === 0) return '/lawyers/lenta?page=1'
		if (previousPageData && previousPageData.length < PAGE_SIZE) return null
		return `/lawyers/lenta?page=${pageIndex + 1}`
	}

	const { data, error, size, setSize, mutate } = useSWRInfinite(getKey, fetcher)

	const items = data ? data.flat() : []
	const isLoadingInitialData = !data && !error
	const isLoadingMore = isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === 'undefined')
	const isReachingEnd = data && data[data.length - 1]?.length < PAGE_SIZE

	return { items, error, isLoadingMore, setSize, size, isReachingEnd, mutate }
}
