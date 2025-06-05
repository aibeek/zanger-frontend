import { useMemo } from 'react'

export const sortRegions = (data: Array<{ name?: string; type?: { name: string } }>) => {
	if (!Array.isArray(data)) return []

	const filtered = data.filter((item) => typeof item?.name === 'string')

	const sorted = filtered.sort((a, b) => a.name?.localeCompare(b.name || '') || 0)

	return sorted
}

const getUniqueRegions = (regions: any[]) => {
	const map = new Map<number, any>()
	for (const r of regions) {
		if (r?.id && !map.has(r.id)) map.set(r.id, r)
	}
	return Array.from(map.values())
}

export function useRegionsUtils(regionsFromApi: any[] | undefined, servicingCities: any[] | undefined) {
	const orderedRegions = useMemo(() => {
		if (!regionsFromApi || regionsFromApi.length === 0) return []

		const filtered = regionsFromApi.filter((r) => r.order_number !== null && r.order_number !== undefined)

		return sortRegions(filtered)
	}, [regionsFromApi])

	const searchRegions = useMemo(() => {
		if (!regionsFromApi) return []

		const combined = [...(servicingCities || []), ...regionsFromApi, ...orderedRegions]
		return sortRegions(getUniqueRegions(combined))
	}, [regionsFromApi, servicingCities, orderedRegions])

	const allOptions = useMemo(() => {
		const combined = [...searchRegions, ...orderedRegions, ...(servicingCities || [])]
		return getUniqueRegions(combined)
	}, [searchRegions, orderedRegions, servicingCities])

	const optionsForSelect = useMemo(() => {
		if (!servicingCities) return orderedRegions

		const combined = [...orderedRegions]
		servicingCities.forEach((region) => {
			// @ts-expect-error fix it
			if (!combined.find((r) => r.id === region.id)) combined.push(region)
		})

		return sortRegions(combined)
	}, [orderedRegions, servicingCities])

	return {
		STATIC_REGIONS: orderedRegions,
		searchRegions,
		allOptions,
		optionsForSelect,
	}
}
