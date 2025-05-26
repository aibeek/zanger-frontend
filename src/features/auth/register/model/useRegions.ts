import { sharedApi, City } from '@/shared/api'
import useSWR from 'swr'

const fetchRegions = async (): Promise<City[]> => {
	const firstPageRes = await sharedApi.regionsPaginated()

	// @ts-expect-error fix it
	const firstPageData = firstPageRes.data as City[]
	// @ts-expect-error fix it
	const totalPages = firstPageRes.meta.last_page

	let otherPagesData: City[] = []

	if (totalPages > 1) {
		const pageRequests = []

		for (let i = 2; i <= totalPages; i++) {
			pageRequests.push(sharedApi.regionsPaginated(i))
		}

		const otherPagesResponses = await Promise.all(pageRequests)

		otherPagesData = otherPagesResponses.flatMap((res) => res.data as City[])
	}

	const regions = [...firstPageData, ...otherPagesData]

	const citiesRes = await sharedApi.getCities()
	// @ts-expect-error fix it
	const cities = citiesRes.data as City[]

	const topLevelCities = cities.filter((c) => c.path === c.name).sort((a, b) => a.name.localeCompare(b.name, 'ru'))

	const regionalCities = regions
		.sort((a, b) => a.name.localeCompare(b.name, 'ru'))
		.flatMap((region) => {
			const fullRegionName = region.name.endsWith('область') ? region.name : `${region.name} область`

			const citiesInRegion = cities
				.filter((city) => city.path.includes(fullRegionName))
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
