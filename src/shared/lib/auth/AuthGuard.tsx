'use client'

import { useEffect, ReactNode } from 'react'
import { useParams, useRouter } from 'next/navigation'

import { useAuthStore } from './authStore'
import { Loader } from '@/shared/ui-kit'

interface AuthGuardProps {
	children: ReactNode
}

const AuthGuard = ({ children }: AuthGuardProps) => {
	const { isAuthenticated, authChecked, checkAuth } = useAuthStore()
	const router = useRouter()
	const { locale } = useParams()

	useEffect(() => {
		checkAuth()
	}, [checkAuth])

	useEffect(() => {
		if (authChecked && !isAuthenticated) {
			router.push(`/${locale}/auth/login`)
		}
	}, [authChecked, isAuthenticated, router, locale])

	if (!authChecked) {
		return <Loader />
	}

	return <>{children}</>
}

export default AuthGuard
