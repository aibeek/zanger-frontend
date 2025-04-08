'use client'

import { useEffect, useState } from 'react'

export const useCountdownTimer = (initialSeconds: number) => {
	const [secondsLeft, setSecondsLeft] = useState(initialSeconds)

	useEffect(() => {
		if (secondsLeft <= 0) return

		const interval = setInterval(() => {
			setSecondsLeft((prev) => prev - 1)
		}, 1000)

		return () => clearInterval(interval)
	}, [secondsLeft])

	const reset = (newSeconds: number = initialSeconds) => {
		setSecondsLeft(newSeconds)
	}

	return {
		secondsLeft,
		isFinished: secondsLeft <= 0,
		reset,
	}
}
