export const createQuery = (params?: { page?: number; per_page?: number; all_regions?: boolean } | Record<string, any>) => {
	if (!params || typeof params !== 'object') {
		return ''
	}
	
	const normalizedParams: Record<string, string> = {}

	for (const [key, value] of Object.entries(params)) {
		if (typeof value === 'boolean') {
			normalizedParams[key] = value ? '1' : '0'
		} else if (value !== undefined) {
			normalizedParams[key] = String(value)
		}
	}

	const query = new URLSearchParams(normalizedParams).toString()
	return query ? `?${query}` : ''
}
