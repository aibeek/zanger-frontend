import { sharedApi, City } from '@/shared/api'
import useSWR from 'swr'

const fetchRegions = async (): Promise<City[]> => {
	const [regionsRes, citiesRes] = await Promise.all([sharedApi.regionsPaginated(), sharedApi.getCities()])

	// @ts-expect-error fix it
	const regions = regionsRes.data as City[]
	// @ts-expect-error fix it
	const cities = citiesRes.data as City[]

	const topLevelCities = cities.filter((c) => c.path === c.name).sort((a, b) => a.name.localeCompare(b.name, 'ru'))

	const groupedRegionsAndCities = regions
		.sort((a, b) => a.name.localeCompare(b.name, 'ru'))
		.flatMap((region) => {
			const citiesInRegion = cities
				.filter((city) => city.path === region.name)
				.sort((a, b) => a.name.localeCompare(b.name, 'ru'))

			return [region, ...citiesInRegion]
		})

	const uniqueRegions = Array.from(
		new Map([...topLevelCities, ...groupedRegionsAndCities].map((item) => [item.name, item])).values(),
	)

	return uniqueRegions
}

export const useRegions = () => {
	const { data, error, isLoading } = useSWR('regions', fetchRegions)
	return {
		regions: data ?? [],
		loadingRegions: isLoading,
		errorRegions: error,
	}
}
