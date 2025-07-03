'use client'

import { useEffect, useState } from 'react'

export function useBrowserLang(): 'kz' | 'ru' {
	const [lang, setLang] = useState<'kz' | 'ru'>('ru')

	useEffect(() => {
		const cookie = document.cookie.split('; ').find((row) => row.startsWith('browserLang='))
		const value = cookie?.split('=')[1]
		setLang(value === 'kz' ? 'kz' : 'ru')
	}, [])

	return lang
}
