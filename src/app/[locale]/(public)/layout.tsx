import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'

import { Header } from '@/widgets/Header'
import { Footer } from '@/widgets/Footer'
import '@/app/styles/index.scss'

const openSans = Open_Sans({
	variable: '--font-open-sans',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'Zanger',
	description: 'Zanger',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="ru">
			<body className={openSans.variable}>
				<Header variant={'lendos-variant'} />
				{children}
				<Footer variant={'lendos-variant'} />
			</body>
		</html>
	)
}
