import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'

import './styles/index.scss'
import { GoogleAnalytics } from '@/shared/lib/analytics/GoogleAnalytics'

const openSans = Open_Sans({
    variable: '--font-open-sans',
    subsets: ['cyrillic', 'latin'],
})

export const metadata: Metadata = {
    title: 'Zanger',
    description: 'Zanger - платформа для юридических услуг',
    icons: {
        icon: '/logo-blue.svg',
        shortcut: '/logo-blue.svg',
        apple: '/logo-blue.svg',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ru" suppressHydrationWarning>
            <body className={openSans.variable} suppressHydrationWarning>
                <GoogleAnalytics />
                {children}
            </body>
        </html>
    )
}
