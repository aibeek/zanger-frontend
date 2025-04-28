import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

export const formatPublishedDate = (dateString: string) => {
	const date = parseISO(dateString)

	if (isToday(date)) {
		return 'Опубликовано сегодня'
	}

	if (isYesterday(date)) {
		return 'Опубликовано вчера'
	}

	return `Опубликовано ${format(date, 'dd.MM / HH:mm', { locale: ru })}`
}
