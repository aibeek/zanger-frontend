import type { Metadata } from 'next'
import React from 'react'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { PageViewTracker } from '@/shared/lib/analytics/PageViewTracker'

export const metadata: Metadata = {
    title: 'Zanger',
    description: 'Zanger',
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params

    if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
        notFound()
    }

    const messages = (await import(`../../../locales/${locale}/messages.json`)).default

    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            <PageViewTracker />
            {children}
        </NextIntlClientProvider>
    )
}
