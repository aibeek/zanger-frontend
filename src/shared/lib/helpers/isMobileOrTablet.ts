'use client'

import { UAParser } from 'ua-parser-js'

export const isMobileOrTablet = () => {
	if (typeof window === 'undefined') return false

	const parser = new UAParser()
	const deviceType = parser.getDevice().type
	
	return deviceType === 'mobile' || deviceType === 'tablet'
}
