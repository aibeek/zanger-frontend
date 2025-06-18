import useSWRInfinite from 'swr/infinite'
import { lawyerApi } from '@/shared/api'
import { PAGE_SIZE } from '@/shared/lib'

type Params = {
	all_regions?: boolean
}

const fetcher = async (key: string) => {
	const urlParams = new URLSearchParams(key.split('?')[1])
	const page = Number(urlParams.get('page')) || 1
	const allRegions = urlParams.get('all_regions') === '1'

	const response = await lawyerApi.getOrders({
		all_regions: allRegions,
		all_tags: 1,
		page: page,
		per_page: PAGE_SIZE,
	})

	// @ts-expect-error fix it
	return response.data
}

export const useLentaInfinite = ({ all_regions = false }: Params) => {
	const getKey = (pageIndex: number, previousPageData: any) => {
		if (previousPageData && previousPageData.length < PAGE_SIZE) return null

		const page = pageIndex + 1
		const params = new URLSearchParams({
			page: String(page),
			all_regions: all_regions ? '1' : '0',
		})

		return `/lawyers/lenta?${params.toString()}`
	}

	const { data, error, size, setSize, mutate } = useSWRInfinite(getKey, fetcher)

	const items = data ? data.flat() : []
	const isLoadingInitialData = !data && !error
	const isLoadingMore = isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === 'undefined')
	const isReachingEnd = data && data[data.length - 1]?.length < PAGE_SIZE

	return { items, error, isLoadingMore, setSize, size, isReachingEnd, mutate }
}
