'use client'

import { useEffect, useState } from 'react'

export function useBrowserLang(): 'kk' | 'ru' {
	const [lang, setLang] = useState<'kk' | 'ru'>('ru')

	useEffect(() => {
		const cookie = document.cookie.split('; ').find((row) => row.startsWith('browserLang='))
		const value = cookie?.split('=')[1]
		setLang(value === 'kk' ? 'kk' : 'ru')
	}, [])

	return lang
}
