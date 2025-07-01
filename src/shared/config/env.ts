export const API_URL = process.env.NEXT_PUBLIC_API_URL!
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!

if (!API_URL) {
	throw new Error('Environment variable NEXT_PUBLIC_API_URL is not defined')
}

if (!BASE_URL) {
	throw new Error('Environment variable NEXT_PUBLIC_BASE_URL is not defined')
}
