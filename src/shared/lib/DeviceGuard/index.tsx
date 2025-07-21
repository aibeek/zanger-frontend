'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

import { isMobileOrTablet } from '../helpers'

interface AuthGuardProps {
	children: ReactNode
}

export const DeviceGuard = ({ children }: AuthGuardProps) => {
	const [isMobile, setIsMobile] = useState(false)
	const router = useRouter()
	const pathname = usePathname()

	useEffect(() => {
		setIsMobile(isMobileOrTablet())
	}, [])

	useEffect(() => {
		if (!isMobile) return

		const isAllowedPath = /^\/(ru|kz)?\/?$/.test(pathname)

		if (!isAllowedPath) {
			const match = pathname.match(/^\/(ru|kz)/)
			const locale = match?.[1] || 'ru'

			router.replace(`/${locale}`)
		}
	}, [isMobile, pathname, router])

	return <>{children}</>
}
