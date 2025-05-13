import s from './DateComponent.module.scss'
import { useTranslations } from 'next-intl'
import { formatPublishedDate } from '@/shared/lib'

interface Props {
	date: string
}

export const DateComponent = ({ date }: Props) => {
	const t = useTranslations()

	return (
		<div className={s.date}>
			<p>
				{t('published')}: <span>{formatPublishedDate(date)}</span>
			</p>
		</div>
	)
}
