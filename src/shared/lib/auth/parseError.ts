export const parseError = (e: any, fallback = 'Что-то пошло не так') => {
	return e?.response?.data?.message || e?.message || fallback
}
