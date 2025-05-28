import useSWR from 'swr'

import { sharedApi, City } from '@/shared/api'

const fetchRegions = async (): Promise<City[]> => {
	const res = await sharedApi.getAllRegions()

	// @ts-expect-error fix it
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
