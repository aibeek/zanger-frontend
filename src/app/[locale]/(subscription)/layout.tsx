import type { Metadata } from 'next'
import React from 'react'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages } from 'next-intl/server'

import { AuthGuard } from '@/shared/lib'
import { Footer } from '@/widgets/Footer'
import { Header } from '@/widgets/Header'
import { AppToaster } from '@/shared/ui-kit'
import { PulseChatWidget } from '@/widgets/PulseChatWidget'
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

	// Получаем сообщения для локали
	const messages = await getMessages()

	return (
		<NextIntlClientProvider messages={messages}>
			<AuthGuard>
				<SWRConfig value={{ shouldRetryOnError: false }}>
					<div className="authed-wrapper">
						<div className="dashboard-top">
							<Header variant="user-variant" />
							{children}
							<AppToaster />
						</div>
						<Footer variant="user-variant" />
						<PulseChatWidget />
					</div>
				</SWRConfig>
			</AuthGuard>
		</NextIntlClientProvider>
	)
}
