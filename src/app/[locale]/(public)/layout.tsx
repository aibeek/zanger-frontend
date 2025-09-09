import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'

import '@/app/styles/index.scss'
import { Footer } from '@/widgets/Footer'
import { DeviceGuard } from '@/shared/lib/DeviceGuard'
import { AppToaster } from '@/shared/ui-kit'
import { Header } from '@/widgets/Header'
import { ChatBot } from '@/widgets/ChatBot'
import { PulseChat } from '@/widgets/PulseChat'

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

	return (
		<html lang={locale}>
			<body className={openSans.variable}>
				<NextIntlClientProvider>
					<AppToaster />
					<DeviceGuard>
						<div className="lending-layout">
							<Header variant={'lending-variant'} />
							{children}
							<Footer
								id={'footer'}
								variant={'lending-variant'}
							/>
							<ChatBot />
							<PulseChat />
						</div>
					</DeviceGuard>
				</NextIntlClientProvider>
			</body>
		</html>
	)
}
