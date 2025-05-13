export const createPaginationQuery = (params: { page?: number; per_page?: number }) => {
	const query = new URLSearchParams(params as Record<string, string>).toString()
	return query ? `?${query}` : ''
}
