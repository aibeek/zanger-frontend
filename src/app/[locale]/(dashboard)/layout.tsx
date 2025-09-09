import type { Metadata } from 'next'
import React from 'react'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import { Open_Sans } from 'next/font/google'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Footer } from '@/widgets/Footer'
import { Header } from '@/widgets/Header'
import '@/app/styles/index.scss'
import { AuthGuard } from '@/shared/lib'
import { DashboardLayout } from '@/shared/ui-kit/DashboardLayout'
import { AppToaster } from '@/shared/ui-kit'
import { ChatBot } from '@/widgets/ChatBot'
import { PulseChat } from '@/widgets/PulseChat'
import { SWRConfig } from 'swr'

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

export default async function DashboardLayoutRoot({
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
		<html lang={locale}>
			<body className={openSans.variable}>
				<NextIntlClientProvider messages={messages}>
					<AuthGuard>
						<SWRConfig value={{ shouldRetryOnError: false }}>
							<div className="authed-wrapper">
								<div className="dashboard-top">
									<Header variant="user-variant" />
										<AppToaster />
								</div>
								<Footer variant="user-variant" />
								<ChatBot />
								<PulseChat />
							</div>
						</SWRConfig>
					</AuthGuard>
				</NextIntlClientProvider>
			</body>
		</html>
	)
}