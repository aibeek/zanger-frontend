import type { Metadata } from 'next'
import React from 'react'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'

export const metadata: Metadata = {
    title: 'Zanger',
    description: 'Zanger',
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: { locale: string }
}) {
    const { locale } = params

    if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
        notFound()
    }

    const messages = (await import(`../../../locales/${locale}/messages.json`)).default

    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
        </NextIntlClientProvider>
    )
}
