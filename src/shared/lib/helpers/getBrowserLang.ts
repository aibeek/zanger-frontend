import { cookies } from 'next/headers'

export async function getBrowserLang(): Promise<'kk' | 'ru'> {
	const lang = (await cookies()).get('browserLang')?.value
	return lang === 'kk' ? 'kk' : 'ru'
}
