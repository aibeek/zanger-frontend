'use client'

import useSWR from 'swr'

import { sharedApi, City, CitiesResponse } from '@/shared/api'

const fetchRegions = async (): Promise<City[]> => {
	const res: CitiesResponse = await sharedApi.getAllRegions()
	return res.data
}

export const useRegions = () => {
	const { data, error, isLoading } = useSWR<City[]>('regions', fetchRegions, {
		revalidateOnFocus: false,
		revalidateOnReconnect: false,
	})

	return {
		regions: data ?? [],
		loadingRegions: isLoading,
		errorRegions: error,
	}
}
