import type { Metadata } from 'next'
import React from 'react'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import { Open_Sans } from 'next/font/google'
import { NextIntlClientProvider, hasLocale } from 'next-intl'

import '@/app/styles/index.scss'
import { AuthGuard } from '@/shared/lib'
import { AppToaster } from '@/shared/ui-kit'
import { ChatBot } from '@/widgets/ChatBot'
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
                    {process.env.NODE_ENV === 'development' ? (
                        <SWRConfig value={{ shouldRetryOnError: false }}>
                            <DevErrorBoundary>
                                <DashboardLayout language={locale}>
                                    {children}
                                </DashboardLayout>
                                <AppToaster />
                                <ChatBot />
                            </DevErrorBoundary>
                        </SWRConfig>
                    ) : (
                        <AuthGuard>
                            <SWRConfig value={{ shouldRetryOnError: false }}>
                                <DashboardLayout language={locale}>
                                    {children}
                                </DashboardLayout>
                                <AppToaster />
                                <ChatBot />
                            </SWRConfig>
                        </AuthGuard>
                    )}
                </NextIntlClientProvider>
            </body>
        </html>
    )
}