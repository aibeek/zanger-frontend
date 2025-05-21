import { sharedApi, City } from '@/shared/api'
import useSWR from 'swr'

const fetchRegions = async (): Promise<City[]> => {
	const [regionsRes, citiesRes] = await Promise.all([sharedApi.regionsPaginated(), sharedApi.getCities()])

	// @ts-expect-error fix it
	const regions = regionsRes.data as City[]
	// @ts-expect-error fix it
	const cities = citiesRes.data as City[]

	const topLevelCities = cities.filter((c) => c.path === c.name).sort((a, b) => a.name.localeCompare(b.name, 'ru'))

	const regionalCities = regions
		.sort((a, b) => a.name.localeCompare(b.name, 'ru'))
		.flatMap((region) => {
			const fullRegionName = region.name.endsWith('область') ? region.name : `${region.name} область`

			const citiesInRegion = cities
				.filter((city) => city.path.includes(region.name))
				.sort((a, b) => a.name.localeCompare(b.name, 'ru'))

			return citiesInRegion
		})

	const usedCityIds = new Set([...topLevelCities, ...regionalCities].map((item) => item.id))

	const unusedCities = cities.filter((city) => !usedCityIds.has(city.id))

	const allItems = [...topLevelCities, ...regionalCities, ...unusedCities]

	const uniqueItems = Array.from(new Map(allItems.map((item) => [item.id, item])).values())

	return uniqueItems
}

export const useRegions = () => {
	const { data, error, isLoading } = useSWR('regions', fetchRegions)
	return {
		regions: data ?? [],
		loadingRegions: isLoading,
		errorRegions: error,
	}
}
