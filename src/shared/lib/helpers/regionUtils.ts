export const sortRegions = (data) => {
	if (!Array.isArray(data)) return []

	const filtered = data.filter((item) => item.type.name !== 'Другое')

	const cities = []
	const regions = []
	const villages = []
	const labels = []

	filtered.forEach((item) => {
		const type = item.type.name
		if (type === 'Город') {
			cities.push(item)
		} else if (type === 'Регион') {
			regions.push(item)
		} else if (type === 'Село') {
			villages.push(item)
		} else if (type === 'Район' || type === 'Область') {
			labels.push(item)
		}
	})

	cities.sort((a, b) => b.name.localeCompare(a.name))
	regions.sort((a, b) => b.name.localeCompare(a.name))
	villages.sort((a, b) => b.name.localeCompare(a.name))

	return [...cities, ...regions, ...villages]
}

export const regionGroupBy = (item) => {
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
