'use client'

import Image from 'next/image'
import React, { useEffect } from 'react'

import HiIcon from '@/app/assets/icons/hi.png'
import { allTabs, defaultTabByRole } from '@/shared'
import { useLoginStore } from '@/features/auth/login'
import { DashboardTabs } from '@/widgets/DashboardTabs'

import s from './DashboardWrapper.module.scss'

export const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
	const { personalData, getPersonalDataByToken } = useLoginStore()

	useEffect(() => {
		if (!personalData) {
			getPersonalDataByToken()
		}
	}, [personalData, getPersonalDataByToken])

	if (!personalData) {
		return null
	}

	const role = personalData.role_id.code as 'client' | 'lawyer'
	// @ts-expect-error fix it
	const tabs = allTabs.filter((tab) => !tab.onlyFor || tab.onlyFor === role)
	const defaultTab = defaultTabByRole[role]

	return (
		<div className="little-container">
			<div className={s.box}>
				<div className={s.greetings}>
					<h1 className={s.title}>
						Привет, <span>{personalData.name}</span>!
					</h1>
					<Image
						src={HiIcon}
						alt="приветствие"
						width={24}
						height={24}
						className={s.hiImg}
					/>
				</div>
				<div className={s.descr}>
					{personalData.role_id.code === 'client' && (
						<p>Оформите запрос для специалистов в области права, и они свяжутся с вами в ближайшее время</p>
					)}
				</div>
			</div>
			<DashboardTabs
				userRole={role}
				tabs={tabs}
				defaultTab={defaultTab}
			/>
			<main>{children}</main>
		</div>
	)
}
