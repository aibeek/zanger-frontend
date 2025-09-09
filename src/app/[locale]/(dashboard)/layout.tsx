import type { Metadata } from 'next'
import React from 'react'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import { Open_Sans } from 'next/font/google'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages } from 'next-intl/server'

import '@/app/styles/index.scss'
import { AuthGuard } from '@/shared/lib'
import { AppToaster } from '@/shared/ui-kit'
import { DashboardWrapper } from '@/widgets/DashboardWrapper'
import { SWRConfig } from 'swr'
import { DevErrorBoundary } from '@/shared/ui-kit/DevErrorBoundary/DevErrorBoundary'
import { DashboardLayout } from '@/shared/ui-kit/DashboardLayout'

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
    params: { locale: string }
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
									<DashboardWrapper>
										{children}
										<AppToaster />
									</DashboardWrapper>
								</div>
								<Footer variant="user-variant" />
								<ChatBot />
							</div>
						</SWRConfig>
					</AuthGuard>
				</NextIntlClientProvider>
			</body>
		</html>
	)
}