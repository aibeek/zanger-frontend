import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages } from 'next-intl/server'

import { routing } from '@/i18n/routing'
import { SWRConfig } from 'swr'

export const metadata: Metadata = {
	title: 'Zanger',
	description: 'Zanger',
	icons: {
		icon: '/logo-blue.svg',
		shortcut: '/logo-blue.svg',
		apple: '/logo-blue.svg',
	},
}

export default async function AuthLayout({
	children,
	params,
}: {
	children: React.ReactNode
	params: Promise<{ locale: string }>
}) {
	const { locale } = await params
	if (!hasLocale(routing.locales, locale)) {
		notFound()
	}

	// Получаем сообщения для локали
	const messages = await getMessages()

	return (
		<NextIntlClientProvider messages={messages}>
			<SWRConfig value={{ shouldRetryOnError: false }}>
				<div className="auth-wrapper">
                    {/* Header удален на страницах авторизации */}
                    <section>{children}</section>
                </div>
			</SWRConfig>
		</NextIntlClientProvider>
	)
}
