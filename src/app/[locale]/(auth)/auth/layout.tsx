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

export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="ru">
			<body className={openSans.variable}>
				<div className="authedWrapper">
					<Header variant={'user-variant'} />
					<section>{children}</section>
					<Footer variant={'user-variant'} />
				</div>
			</body>
		</html>
	)
}
