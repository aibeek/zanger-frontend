import useSWRInfinite from 'swr/infinite'
import { lawyerApi } from '@/shared/api'
import { PAGE_SIZE } from '@/shared/lib'

type Params = {
	all_regions?: boolean
	region_id?: number
	specialization_id?: number
	date?: string
}

const fetcher = async (key: string) => {
	const urlParams = new URLSearchParams(key.split('?')[1])
	const page = Number(urlParams.get('page')) || 1
	const allRegions = urlParams.get('all_regions') === '1'
	const region_id = urlParams.get('region_id')
	const specialization_id = urlParams.get('specialization_id')
	const date = urlParams.get('date')

	const response = await lawyerApi.getOrders({
		all_regions: allRegions,
		all_tags: 1,
		page: page,
		per_page: PAGE_SIZE,
		...(region_id ? { region_id: Number(region_id) } : {}),
		...(specialization_id ? { specialization_id: Number(specialization_id) } : {}),
		...(date ? { date } : {}),
	})

	// @ts-expect-error fix it
	return response.data
}

export const useLentaInfinite = ({ all_regions = false, region_id, specialization_id, date }: Params) => {
	const getKey = (pageIndex: number, previousPageData: any) => {
		if (previousPageData && previousPageData.length < PAGE_SIZE) return null

		const page = pageIndex + 1
		const params = new URLSearchParams({
			page: String(page),
			all_regions: all_regions ? '1' : '0',
		})
		if (region_id) params.set('region_id', String(region_id))
		if (specialization_id) params.set('specialization_id', String(specialization_id))
		if (date) params.set('date', date)

		return `/lawyers/lenta?${params.toString()}`
	}

	const { data, error, size, setSize, mutate } = useSWRInfinite(getKey, fetcher)

	const items = data ? data.flat() : []
	const isLoadingInitialData = !data && !error
	const isLoadingMore = isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === 'undefined')
	const isReachingEnd = data && data[data.length - 1]?.length < PAGE_SIZE

	return { items, error, isLoadingMore, setSize, size, isReachingEnd, mutate }
}
