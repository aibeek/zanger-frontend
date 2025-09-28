'use client'

import useSWRInfinite from 'swr/infinite'

import { clientApi } from '@/shared/api'
import { PAGE_SIZE } from '@/shared/lib'

const fetcher = async (key: string) => {
	const urlParams = new URLSearchParams(key.split('?')[1])
	const page = Number(urlParams.get('page')) || 1

	const response = await clientApi.historyApplications({
		page,
		per_page: PAGE_SIZE,
	})

	// @ts-expect-error fix it
	return response.data
}

export const useApplicationsHistoryInfinite = (enabled = true) => {
	const getKey = (pageIndex: number, previousPageData: any) => {
		if (!enabled) return null
		if (previousPageData && previousPageData.length < PAGE_SIZE) return null
		return `/applications-history?page=${pageIndex + 1}`
	}

	const { data, error, size, setSize } = useSWRInfinite(getKey, fetcher)

	const items = data ? data.flat() : []
	const isLoadingInitialData = !data && !error
	const isLoadingMore = isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === 'undefined')
	const isReachingEnd = data && data[data.length - 1]?.length < PAGE_SIZE

	return { items, error, isLoadingMore, setSize, size, isReachingEnd }
}
