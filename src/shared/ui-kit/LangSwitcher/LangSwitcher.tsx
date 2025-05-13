'use client'

import clsx from 'clsx'
import { useLocale } from 'next-intl'
import { usePathname } from '@/i18n'
import { routing, Link } from '@/i18n'
import s from './LangSwitcher.module.scss'

export function LangSwitcher() {
	const pathname = usePathname()
	const currentLocale = useLocale()

	const handleClick = (locale: string) => {
		document.cookie = `browserLang=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`
	}

	return (
		<div className={s.wrapper}>
			{routing.locales.map((locale) => (
				<Link
					key={locale}
					href={pathname}
					locale={locale}
					className={clsx(s.btn, {
						[s.btnActive]: currentLocale === locale,
					})}
					onClick={() => handleClick(locale)}>
					{locale === 'ru' ? 'Рус' : 'Қаз'}
				</Link>
			))}
		</div>
	)
}
