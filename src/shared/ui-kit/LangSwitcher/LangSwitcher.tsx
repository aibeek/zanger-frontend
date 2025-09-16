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
import { useState, useEffect, useRef } from 'react'

export function LangSwitcher() {
	const pathname = usePathname()
	const currentLocale = useLocale()
	const { isAuthenticated } = useAuthStore()
	const [isOpen, setIsOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	const handleClick = async (locale: string) => {
		if (isAuthenticated) {
			try {
				await profileApi.updateLanguage({ language: locale })
				await refreshUser()
			} catch (error) {
				console.error('Ошибка при смене языка:', error)
				toast.error('Произошла ошибка при смене языка')
				return
			}
		}
		document.cookie = `browserLang=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`
		setIsOpen(false)
	}

	const currentLangDisplay = currentLocale === 'ru' ? 'RU' : 'KZ'

	return (
		<div className={s.langSwitcher} ref={dropdownRef}>
			<button 
				className={s.currentLang}
				onClick={() => setIsOpen(!isOpen)}
			>
				{currentLangDisplay}
				<span className={s.arrow}>▼</span>
			</button>
			{isOpen && (
				<div className={s.dropdown}>
					{routing.locales.map((locale) => (
						<Link
							key={locale}
							href={pathname}
							locale={locale}
							className={clsx(s.option, {
								[s.active]: currentLocale === locale,
							})}
							onClick={() => handleClick(locale)}>
							{locale === 'ru' ? 'RU' : 'KZ'}
						</Link>
					))}
				</div>
			)}
		</div>
	)
}
