import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { ru, kk } from 'date-fns/locale'

const getLocaleFromCookies = () => {
	const cookies = document.cookie.split('; ')
	const localeCookie = cookies.find((cookie) => cookie.startsWith('NEXT_LOCALE='))
	return localeCookie?.split('=')[1] || 'ru'
}

export const formatPublishedDate = (dateString?: string): string => {
	if (!dateString) return ''

	let date: Date
	try {
		date = parseISO(dateString)
	} catch {
		return ''
	}

	const locale = getLocaleFromCookies()
	const localeMap = { ru, kk }
	const selectedLocale = localeMap[locale] || ru

	const time = format(date, 'HH:mm')

	if (isToday(date)) return locale === 'ru' ? `сегодня ${time}` : `бүгін ${time}`
	if (isYesterday(date)) return locale === 'ru' ? `вчера ${time}` : `кеше ${time}`

	return format(date, 'd MMM yyyy / HH:mm', { locale: selectedLocale })
}
