import type { Metadata } from 'next'
import React from 'react'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import { Open_Sans } from 'next/font/google'
import { NextIntlClientProvider, hasLocale } from 'next-intl'

import '@/app/styles/index.scss'
import { AuthGuard } from '@/shared/lib'
import { Footer } from '@/widgets/Footer'
import { Header } from '@/widgets/Header'
import { AppToaster } from '@/shared/ui-kit'
import { SWRConfig } from 'swr'

const openSans = Open_Sans({
	variable: '--font-open-sans',
	subsets: ['cyrillic', 'latin'],
})

export const metadata: Metadata = {
	title: 'Zanger',
	description: 'Zanger',
	icons: {
		icon: '/logo.svg',
		shortcut: '/logo.svg',
		apple: '/logo.svg',
	},
}

export default async function DashboardLayout({
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
					<AuthGuard>
						<SWRConfig value={{ shouldRetryOnError: false }}>
							<div className="authed-wrapper">
								<div className="dashboard-top">
									<Header variant="user-variant" />
									{children}
									<AppToaster />
								</div>
								<Footer variant="user-variant" />
							</div>
						</SWRConfig>
					</AuthGuard>
				</NextIntlClientProvider>
			</body>
		</html>
	)
}
