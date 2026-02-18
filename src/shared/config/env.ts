export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? ''
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

// Video API base URL
export const VIDEO_API_BASE_URL = 'https://video.zanger-app.kz/vidapi'
// export const VIDEO_API_BASE_URL = 'http://localhost:8090'

// WebSocket (Soketi) configuration
export const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY || ''
export const PUSHER_HOST = process.env.NEXT_PUBLIC_PUSHER_HOST || ''
export const PUSHER_PORT = process.env.NEXT_PUBLIC_PUSHER_PORT || '6001'

const missingVars = [
	!process.env.NEXT_PUBLIC_API_URL ? 'NEXT_PUBLIC_API_URL' : '',
	!process.env.NEXT_PUBLIC_BASE_URL ? 'NEXT_PUBLIC_BASE_URL' : '',
].filter(Boolean)

if (missingVars.length > 0) {
	const message = `Missing environment variable(s): ${missingVars.join(', ')}`
	if (process.env.NODE_ENV === 'production') {
		throw new Error(message)
	}
	console.warn(`[env] ${message}. Falling back to relative URLs for local development.`)
}
