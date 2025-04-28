'use client'

import clsx from 'clsx'
import { usePathname, useRouter } from 'next/navigation'

import s from './DashboardTabs.module.scss'
import Image from 'next/image'

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

export const DashboardTabs = ({ locale = 'ru', tabs, defaultTab }: Props) => {
	const pathname = usePathname()
	const router = useRouter()

	const activeTab = pathname.split('/').pop() || defaultTab

	return (
		<div className={s.tabList}>
			{tabs.map((tab) => {
				return (
					<div
						key={tab.route}
						className={clsx(s.tab, {
							[s.active]: activeTab === tab.route,
						})}
						onClick={() => router.push(`/${locale}/dashboard/${tab.route}`)}>
						<Image
							src={tab.icon}
							alt="иконка"
							className={s.logo}
							width={24}
							height={24}
						/>
						{tab.name}
					</div>
				)
			})}
		</div>
	)
}
