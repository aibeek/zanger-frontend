import { Footer } from '@/widgets/Footer'
import { Header } from '@/widgets/Header'
import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'

import '@/app/styles/index.scss'

const openSans = Open_Sans({
	variable: '--font-open-sans',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'Zanger dashboard',
	description: 'Zanger',
}

import React from 'react'
import AuthGuard from '@/shared/lib/auth/AuthGuard'

export default function LawyerLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="ru">
			<body className={openSans.variable}>
				<AuthGuard>
					<div className="authedWrapper">
						<Header variant={'user-variant'} />
						<main>{children}</main>
						<Footer variant={'user-variant'} />
					</div>
				</AuthGuard>
			</body>
		</html>
	)
}
