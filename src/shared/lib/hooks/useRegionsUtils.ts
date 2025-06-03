import { useMemo } from 'react'

export const STATIC_REGIONS = [
	{ id: 2, translationKey: 'regions.astana', type: { name: 'Город' } },
	{ id: 1, translationKey: 'regions.almaty', type: { name: 'Город' } },
	{ id: 3, translationKey: 'regions.shymkent', type: { name: 'Город' } },
	{ id: 7, translationKey: 'regions.semei', type: { name: 'Город' } },
	{ id: 34, translationKey: 'regions.kokshetau', type: { name: 'Город' } },
	{ id: 3463, translationKey: 'regions.akhtobe', type: { name: 'Город' } },
	{ id: 23, translationKey: 'regions.konaev', type: { name: 'Город' } },
	{ id: 4, translationKey: 'regions.atyrau', type: { name: 'Город' } },
	{ id: 37, translationKey: 'regions.uskemen', type: { name: 'Город' } },
	{ id: 9, translationKey: 'regions.taraz', type: { name: 'Город' } },
	{ id: 36, translationKey: 'regions.taldykorgan', type: { name: 'Город' } },
	{ id: 6, translationKey: 'regions.oral', type: { name: 'Город' } },
	{ id: 38, translationKey: 'regions.karaganda', type: { name: 'Город' } },
	{ id: 39, translationKey: 'regions.kostanay', type: { name: 'Город' } },
	{ id: 10, translationKey: 'regions.kyzylorda', type: { name: 'Город' } },
	{ id: 3269, translationKey: 'regions.aktau', type: { name: 'Город' } },
	{ id: 11, translationKey: 'regions.pavlodar', type: { name: 'Город' } },
	{ id: 40, translationKey: 'regions.petropavl', type: { name: 'Город' } },
	{ id: 395, translationKey: 'regions.turkistan', type: { name: 'Город' } },
	{ id: 301, translationKey: 'regions.zhezkazgan', type: { name: 'Город' } },
]

export const sortRegions = (data: Array<{ name?: string; type?: { name: string } }>) => {
	if (!Array.isArray(data)) return []

	const filtered = data.filter((item) => item?.type?.name !== 'Другое' && typeof item?.name === 'string')

	const cities = []
	const regions = []
	const villages = []

	filtered.forEach((item) => {
		const type = item?.type?.name
		if (type === 'Город') {
			cities.push(item)
		} else if (type === 'Регион') {
			regions.push(item)
		} else if (type === 'Село') {
			villages.push(item)
		}
	})

	const safeSort = (arr: typeof data) =>
		arr.sort((a, b) => {
			if (!a.name || !b.name) return 0
			return b.name.localeCompare(a.name)
		})

	safeSort(cities)
	safeSort(regions)
	safeSort(villages)

	return [...cities, ...regions, ...villages]
}

export const regionGroupBy = (item: { type: { name: string } }) => {
	switch (item.type.name) {
		case 'Город':
			return '3. Город'
		case 'Регион':
			return '2. Регион'
		case 'Село':
			return '1. Село'
		default:
			return item.type.name
	}
}

export function useRegionsUtils(
	regionsFromApi: any[] | undefined,
	servicingCities: any[] | undefined,
	t: (key: string) => string,
) {
	const staticSortedRegions = useMemo(() => {
		return sortRegions(
			STATIC_REGIONS.map((region) => ({
				...region,
				name: t(region.translationKey),
			})),
		)
	}, [t])

	const searchRegions = useMemo(() => {
		if (!regionsFromApi) return []

		const combined = [...(servicingCities || []), ...regionsFromApi, ...staticSortedRegions]
		const uniqueById = new Map<number, any>()

		combined.forEach((region) => {
			if (region?.id && !uniqueById.has(region.id)) uniqueById.set(region.id, region)
		})

		return sortRegions(Array.from(uniqueById.values()))
	}, [regionsFromApi, servicingCities, staticSortedRegions])

	const allOptions = useMemo(() => {
		const combined = [...searchRegions, ...staticSortedRegions, ...(servicingCities || [])]
		const seen = new Set<number>()
		return combined.filter((item) => {
			if (seen.has(item.id)) return false
			seen.add(item.id)
			return true
		})
	}, [searchRegions, staticSortedRegions, servicingCities])

	const optionsForSelect = useMemo(() => {
		if (!servicingCities) return staticSortedRegions

		const combined = [...staticSortedRegions]
		servicingCities.forEach((region) => {
			if (!combined.find((r) => r.id === region.id)) combined.push(region)
		})

		return sortRegions(combined)
	}, [staticSortedRegions, servicingCities])

	return { staticSortedRegions, searchRegions, allOptions, optionsForSelect }
}
