import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'

import '@/app/styles/index.scss'
import { Footer } from '@/widgets/Footer'
import { DeviceGuard } from '@/shared/lib/DeviceGuard'
import { AppToaster } from '@/shared/ui-kit'

const openSans = Open_Sans({
	variable: '--font-open-sans',
	subsets: ['cyrillic', 'latin'],
})

export const metadata: Metadata = {
	title: 'Zanger',
	description: 'Zanger',
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
						{children}
						<Footer
							id={'footer'}
							variant={'lending-variant'}
						/>
					</DeviceGuard>
				</NextIntlClientProvider>
			</body>
		</html>
	)
}
