import type { Metadata } from 'next'
import React from 'react'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import { Open_Sans } from 'next/font/google'
import { NextIntlClientProvider, hasLocale } from 'next-intl'

import '@/app/styles/index.scss'

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

export default async function LocaleLayout({
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
                    {children}
                </NextIntlClientProvider>
            </body>
        </html>
    )
}
