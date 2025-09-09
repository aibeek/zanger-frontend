'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to prevent hydration mismatches by ensuring consistent rendering
 * between server and client. Returns false during SSR and true after hydration.
 */
export function useHydration(): boolean {
	const [isHydrated, setIsHydrated] = useState(false)

	useEffect(() => {
		setIsHydrated(true)
	}, [])

	return isHydrated
}
