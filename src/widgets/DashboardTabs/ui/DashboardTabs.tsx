'use client'

import clsx from 'clsx'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

import s from './DashboardTabs.module.scss'
import Image from 'next/image'
import { useMyResponsesInfinite } from '@/features/my-responses-view'
import { useMyApplicationsInfinite, useMyApplicationsStore } from '@/features/my-applications-view/model'

type Tab = {
	name: string
	route: string
	icon: string
}

type Props = {
	userRole: string
	locale?: string
	tabs: Tab[]
	defaultTab: string
}

export const DashboardTabs = ({ tabs, defaultTab }: Props) => {
	const pathname = usePathname()
	const router = useRouter()
	const t = useTranslations('tabs')
	const { items: myResponses } = useMyResponsesInfinite()
	const { items: myApplications } = useMyApplicationsInfinite()

	const activeTab = pathname.split('/').pop() || defaultTab

	return (
		<div className={s.tabList}>
			{tabs.map((tab) => {
				const isActive = activeTab === tab.route
				const isApplications = tab.name === 'applications'
				const isResponses = tab.name === 'responses'

				return (
					<div
						key={tab.route}
						className={clsx(s.tab, {
							[s.active]: isActive,
						})}
						onClick={() => router.push(`/dashboard/${tab.route}`)}>
						<div className={s.left}>
							<Image
								src={tab.icon}
								alt="иконка"
								className={s.logo}
								width={24}
								height={24}
							/>
							{t(tab.name)}
						</div>

						{(isApplications || isResponses) && (
							<>
								{isApplications && myApplications.length > 0 && (
									<span className={s.notification}>{myApplications.length}</span>
								)}

								{isResponses && myResponses.length > 0 && <span className={s.notification}>{myResponses.length}</span>}
							</>
						)}
					</div>
				)
			})}
		</div>
	)
}
