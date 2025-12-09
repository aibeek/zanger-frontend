import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { ru, kk } from 'date-fns/locale'

export const formatPublishedDate = (dateString?: string, localeCode: 'ru' | 'kk' = 'ru'): string => {
    if (!dateString) return ''

	let date: Date
	try {
		date = parseISO(dateString)
	} catch {
		return ''
	}

    const localeMap = { ru, kk }
    const selectedLocale = localeMap[localeCode] || ru

	const time = format(date, 'HH:mm')

    if (isToday(date)) return localeCode === 'ru' ? `сегодня ${time}` : `бүгін ${time}`
    if (isYesterday(date)) return localeCode === 'ru' ? `вчера ${time}` : `кеше ${time}`

	return format(date, 'd MMM yyyy / HH:mm', { locale: selectedLocale })
}
