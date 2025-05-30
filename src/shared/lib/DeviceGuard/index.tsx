'use client'

import toast from 'react-hot-toast'
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
		if (isMobile && pathname !== '/') {
			router.push('/')
			toast.error('Скачайте приложение для взаимодействия')
		}
	}, [isMobile, pathname, router])

	return <>{children}</>
}
