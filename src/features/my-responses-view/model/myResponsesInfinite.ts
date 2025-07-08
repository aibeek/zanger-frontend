import useSWRInfinite from 'swr/infinite'
import Cookies from 'js-cookie'
import { lawyerApi } from '@/shared/api'
import { PAGE_SIZE } from '@/shared/lib'

const fetcher = async (key: string) => {
	const role = Cookies.get('role')
	if (role !== 'lawyer') return []
	const urlParams = new URLSearchParams(key.split('?')[1])
	const page = Number(urlParams.get('page')) || 1

	const response = await lawyerApi.getResponses({
		page,
		per_page: PAGE_SIZE,
	})

	// @ts-expect-error fix it
	return response.data
}

export const useMyResponsesInfinite = () => {
	const getKey = (pageIndex: number, previousPageData: any) => {
		if (pageIndex === 0) return '/lawyers/responses?page=1'
		if (previousPageData && previousPageData.length < PAGE_SIZE) return null
		return `/lawyers/responses?page=${pageIndex + 1}`
	}

	const { data, size, setSize, error, mutate } = useSWRInfinite(getKey, fetcher)

	const items = data ? data.flat() : []
	const isLoadingInitialData = !data && !error
	const isLoadingMore = isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === 'undefined')
	const isReachingEnd = data && data[data.length - 1]?.length < PAGE_SIZE

	return { items, error, isLoadingMore, setSize, size, isReachingEnd, mutate }
}
