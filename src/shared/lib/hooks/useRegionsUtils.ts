import { useMemo } from 'react'

// export const STATIC_REGIONS = [
// 	{ id: 2, name: 'Астана', nameKK: 'Астана', type: { name: 'Город' } },
// 	{ id: 1, name: 'Алматы', nameKK: 'Алматы', type: { name: 'Город' } },
// 	{ id: 3, name: 'Шымкент', nameKK: 'Шымкент', type: { name: 'Город' } },
// 	{ id: 7, name: 'Семей', nameKK: 'Семей', type: { name: 'Город' } },
// 	{ id: 34, name: 'Кокшетау', nameKK: 'Көкшетау', type: { name: 'Город' } },
// 	{ id: 3463, name: 'Актобе', nameKK: 'Ақтөбе', type: { name: 'Город' } },
// 	{ id: 23, name: 'Конаев', nameKK: 'Қонаев', type: { name: 'Город' } },
// 	{ id: 4, name: 'Атырау', nameKK: 'Атырау', type: { name: 'Город' } },
// 	{ id: 37, name: 'Усть-Каменогорск', nameKK: 'Өскемен', type: { name: 'Город' } },
// 	{ id: 9, name: 'Тараз', nameKK: 'Тараз', type: { name: 'Город' } },
// 	{ id: 36, name: 'Талдыкорган', nameKK: 'Талдықорған', type: { name: 'Город' } },
// 	{ id: 6, name: 'Орал', nameKK: 'Орал', type: { name: 'Город' } },
// 	{ id: 38, name: 'Караганда', nameKK: 'Қарағанды', type: { name: 'Город' } },
// 	{ id: 39, name: 'Костанай', nameKK: 'Қостанай', type: { name: 'Город' } },
// 	{ id: 10, name: 'Кызылорда', nameKK: 'Қызылорда', type: { name: 'Город' } },
// 	{ id: 3269, name: 'Актау', nameKK: 'Ақтау', type: { name: 'Город' } },
// 	{ id: 11, name: 'Павлодар', nameKK: 'Павлодар', type: { name: 'Город' } },
// 	{ id: 40, name: 'Петропавловск', nameKK: 'Петропавл', type: { name: 'Город' } },
// 	{ id: 395, name: 'Туркестан', nameKK: 'Түркістан', type: { name: 'Город' } },
// 	{ id: 301, name: 'Жезказган', nameKK: 'Жезқазған', type: { name: 'Город' } },
// ]

export const STATIC_REGIONS = [
	{ id: 2, name: 'Астана', type: { name: 'Город' } },
	{ id: 1, name: 'Алматы', type: { name: 'Город' } },
	{ id: 3, name: 'Шымкент', type: { name: 'Город' } },
	{ id: 7, name: 'Семей', type: { name: 'Город' } },
	{ id: 34, name: 'Кокшетау', type: { name: 'Город' } },
	{ id: 3463, name: 'Актобе', type: { name: 'Город' } },
	{ id: 23, name: 'Конаев', type: { name: 'Город' } },
	{ id: 4, name: 'Атырау', type: { name: 'Город' } },
	{ id: 37, name: 'Усть-Каменогорск', type: { name: 'Город' } },
	{ id: 9, name: 'Тараз', type: { name: 'Город' } },
	{ id: 36, name: 'Талдыкорган', type: { name: 'Город' } },
	{ id: 6, name: 'Орал', type: { name: 'Город' } },
	{ id: 38, name: 'Караганда', type: { name: 'Город' } },
	{ id: 39, name: 'Костанай', type: { name: 'Город' } },
	{ id: 10, name: 'Кызылорда', type: { name: 'Город' } },
	{ id: 3269, name: 'Актау', type: { name: 'Город' } },
	{ id: 11, name: 'Павлодар', type: { name: 'Город' } },
	{ id: 40, name: 'Петропавловск', type: { name: 'Город' } },
	{ id: 395, name: 'Туркестан', type: { name: 'Город' } },
	{ id: 301, name: 'Жезказган', type: { name: 'Город' } },
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

export function useRegionsUtils(regionsFromApi: any[] | undefined, servicingCities: any[] | undefined) {
	const searchRegions = useMemo(() => {
		if (!regionsFromApi) return []

		const combined = [...(servicingCities || []), ...regionsFromApi, ...STATIC_REGIONS]
		const uniqueById = new Map<number, any>()

		combined.forEach((region) => {
			if (region?.id && !uniqueById.has(region.id)) uniqueById.set(region.id, region)
		})

		return sortRegions(Array.from(uniqueById.values()))
	}, [regionsFromApi, servicingCities, STATIC_REGIONS])

	const allOptions = useMemo(() => {
		const combined = [...searchRegions, ...STATIC_REGIONS, ...(servicingCities || [])]
		const seen = new Set<number>()
		return combined.filter((item) => {
			if (seen.has(item.id)) return false
			seen.add(item.id)
			return true
		})
	}, [searchRegions, STATIC_REGIONS, servicingCities])

	const optionsForSelect = useMemo(() => {
		if (!servicingCities) return STATIC_REGIONS

		const combined = [...STATIC_REGIONS]
		servicingCities.forEach((region) => {
			if (!combined.find((r) => r.id === region.id)) combined.push(region)
		})

		return sortRegions(combined)
	}, [STATIC_REGIONS, servicingCities])

	return { STATIC_REGIONS, searchRegions, allOptions, optionsForSelect }
}
