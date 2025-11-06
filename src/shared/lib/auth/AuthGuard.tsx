'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

import { Loader } from '@/shared/ui-kit'
import { useAuthStore } from './authStore'
import toast from 'react-hot-toast'
import { isMobileOrTablet } from '../helpers'

interface AuthGuardProps {
	children: ReactNode
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
	const { isAuthenticated, authChecked, checkAuth } = useAuthStore()
	const [isMobile, setIsMobile] = useState(false)
	const router = useRouter()
	const pathname = usePathname()

	useEffect(() => {
		checkAuth()
	}, [checkAuth])

	useEffect(() => {
		setIsMobile(isMobileOrTablet())
	}, [])

	useEffect(() => {
		if (authChecked && !isAuthenticated) {
			router.push('/auth/login')
		}
	}, [authChecked, isAuthenticated, router])

	if (!authChecked) {
		return <Loader />
	}

	return <>{children}</>
}
