export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!
export const API_URL = process.env.NEXT_PUBLIC_API_URL!

// Video API base URL
export const VIDEO_API_BASE_URL = 'https://video.zanger-app.kz/vidapi'
// export const VIDEO_API_BASE_URL = 'http://localhost:8090'

if (!API_URL) {
	throw new Error('Environment variable NEXT_PUBLIC_API_URL is not defined')
}

if (!BASE_URL) {
	throw new Error('Environment variable NEXT_PUBLIC_BASE_URL is not defined')
}
