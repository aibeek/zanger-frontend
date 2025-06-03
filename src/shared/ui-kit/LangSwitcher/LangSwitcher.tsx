'use client'

import clsx from 'clsx'
import { useLocale } from 'next-intl'
import { usePathname } from '@/i18n'
import { routing, Link } from '@/i18n'
import s from './LangSwitcher.module.scss'
import { useAuthStore } from '@/shared/lib'
import { profileApi } from '@/shared/api'
import { refreshUser } from '@/shared/lib/helpers/refreshUser'
import toast from 'react-hot-toast'

const mapLocaleToBackend = (locale: string): string => {
	if (locale === 'kk') return 'kz'
	return locale
}

export function LangSwitcher({ hide }: { hide?: boolean }) {
	const pathname = usePathname()
	const currentLocale = useLocale()
	const { isAuthenticated } = useAuthStore()

	const handleClick = async (locale: string) => {
		if (isAuthenticated) {
			try {
				await profileApi.updateLanguage({ language: mapLocaleToBackend(locale) })
				await refreshUser()
			} catch (error) {
				console.error('Ошибка при смене языка:', error)
				toast.error('Произошла ошибка при смене языка')
				return
			}
		}
		document.cookie = `browserLang=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`
	}

	return (
		<div className={clsx(s.wrapper, { [s.hide]: hide })}>
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
