'use client'
import s from './DateComponent.module.scss'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { formatPublishedDate } from '@/shared/lib'

interface Props {
	date: string
}

export const DateComponent = ({ date }: Props) => {
    const t = useTranslations()
    const locale = useLocale() as 'ru' | 'kk'

    return (
        <div className={s.date} suppressHydrationWarning>
            <p>
                <span>{formatPublishedDate(date, locale)}</span>
            </p>
        </div>
    )
}
