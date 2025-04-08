'use client'

import { useState } from 'react'
import { useCountdownTimer } from './useCountdownTimer'

type RequestFn = () => Promise<void>

export const useRequestTimer = (initialSeconds: number, requestFn: RequestFn) => {
	const [hasRequested, setHasRequested] = useState(false)
	const { secondsLeft, isFinished, reset } = useCountdownTimer(initialSeconds)

	const request = async () => {
		try {
			await requestFn()
			setHasRequested(true)
			reset(initialSeconds)
		} catch (error) {
			console.error('Request failed:', error)
		}
	}

	return {
		hasRequested,
		secondsLeft,
		isFinished,
		request,
	}
}
