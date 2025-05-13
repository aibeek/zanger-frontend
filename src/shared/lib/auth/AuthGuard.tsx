'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

import { Loader } from '@/shared/ui-kit'

import { useAuthStore } from './authStore'

interface AuthGuardProps {
	children: ReactNode
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
	const { isAuthenticated, authChecked, checkAuth } = useAuthStore()
	const router = useRouter()

	useEffect(() => {
		checkAuth()
	}, [checkAuth])

	useEffect(() => {
		if (authChecked && !isAuthenticated) {
			router.push(`/auth/login`)
		}
	}, [authChecked, isAuthenticated, router])

	if (!authChecked) {
		return <Loader />
	}

	return <>{children}</>
}
