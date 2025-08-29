import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Open_Sans } from 'next/font/google'
import { NextIntlClientProvider, hasLocale } from 'next-intl'

import '@/app/styles/index.scss'
import { routing } from '@/i18n/routing'
import { Header } from '@/widgets/Header'
import { Footer } from '@/widgets/Footer'
import { SWRConfig } from 'swr'
import { ChatBot } from '@/widgets/ChatBot'

const openSans = Open_Sans({
	variable: '--font-open-sans',
	subsets: ['cyrillic', 'latin'],
})

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
	return (
		<html lang={locale}>
			<body className={openSans.variable}>
				<NextIntlClientProvider>
					<SWRConfig value={{ shouldRetryOnError: false }}>
						<div className="authed-wrapper">
							<Header variant={'user-variant'} />
							<section>{children}</section>
							<Footer variant={'user-variant'} />
							<ChatBot />
						</div>
					</SWRConfig>
				</NextIntlClientProvider>
			</body>
		</html>
	)
}
