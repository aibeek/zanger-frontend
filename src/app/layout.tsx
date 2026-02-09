import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'
import Script from 'next/script'

import './styles/index.scss'

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
    const GA_ID = process.env.NEXT_PUBLIC_GA_ID

    return (
        <html lang="ru" suppressHydrationWarning>
            <head />
            <body className={openSans.variable} suppressHydrationWarning>
                {GA_ID && (
                    <>
                        <Script
                            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                            strategy="afterInteractive"
                        />
                        <Script id="google-analytics" strategy="afterInteractive">
                            {`
                                window.dataLayer = window.dataLayer || [];
                                function gtag(){dataLayer.push(arguments);}
                                gtag('js', new Date());
                                gtag('config', '${GA_ID}');
                            `}
                        </Script>
                    </>
                )}
                {children}
            </body>
        </html>
    )
}
