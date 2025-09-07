'use client'

import { UAParser } from 'ua-parser-js'

export const isMobileOrTablet = () => {
	if (typeof window === 'undefined') return false

	const parser = new UAParser()
	const deviceType = parser.getDevice().type
	const userAgent = window.navigator.userAgent
	
	// Добавляем отладочную информацию
	console.log('Device detection debug:', {
		deviceType,
		userAgent,
		browser: parser.getBrowser(),
		os: parser.getOS(),
		device: parser.getDevice(),
		result: deviceType === 'mobile' || deviceType === 'tablet'
	})

	return deviceType === 'mobile' || deviceType === 'tablet'
}
