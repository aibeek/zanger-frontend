export const API_URL = process.env.NEXT_PUBLIC_API_URL!
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!
export const BASE_URL_PROD = process.env.NEXT_PUBLIC_BASE_URL_PROD!
export const PUBLIC_STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!

if (!API_URL) {
	throw new Error('Environment variable NEXT_PUBLIC_API_URL is not defined')
}

if (!BASE_URL) {
	throw new Error('Environment variable NEXT_PUBLIC_BASE_URL is not defined')
}

if (!BASE_URL_PROD) {
	throw new Error('Environment variable NEXT_PUBLIC_BASE_URL_PROD is not defined')
}

if (!PUBLIC_STRIPE_PUBLISHABLE_KEY) {
	throw new Error('Environment variable PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined')
}
