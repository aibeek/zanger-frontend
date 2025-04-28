import React from 'react'

import '@/app/styles/index.scss'
import { Footer } from '@/widgets/Footer'
import { Header } from '@/widgets/Header'
import AuthGuard from '@/shared/lib/auth/AuthGuard'
import { AppToaster } from '@/shared/ui-kit/AppToaster'
import { DashboardWrapper } from '@/widgets/DashboardWrapper'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="ru">
			<body>
				<AuthGuard>
					<div className="authed-wrapper">
						<div className="dashboard-top">
							<Header variant="user-variant" />
							<DashboardWrapper>
								{children}
								<AppToaster />
							</DashboardWrapper>
						</div>
						<Footer variant="user-variant" />
					</div>
				</AuthGuard>
			</body>
		</html>
	)
}
