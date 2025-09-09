import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Zanger',
    description: 'Zanger - платформа для юридических услуг',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
