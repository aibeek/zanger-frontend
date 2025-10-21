import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import type { Metadata } from 'next'

import { Footer } from '@/widgets/Footer'
import { DeviceGuard } from '@/shared/lib/DeviceGuard'
import { AppToaster } from '@/shared/ui-kit'
// import { PulseChatWidget } from '@/widgets/PulseChatWidget'

export const metadata: Metadata = {
	title: 'Zanger',
	description: 'Zanger',
	icons: {
		icon: '/logo-blue.svg',
		shortcut: '/logo-blue.svg',
		apple: '/logo-blue.svg',
	},
}

export default async function RootLayout({
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
			<AppToaster />
			<DeviceGuard>
				<div className="lending-layout" suppressHydrationWarning>
					{children}
					{/* <PulseChatWidget /> */}
				</div>
			</DeviceGuard>
		</NextIntlClientProvider>
	)
}
