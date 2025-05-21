'use client'

import Image from 'next/image'
import React, { useEffect } from 'react'
import { useTranslations } from 'next-intl'

import HiIcon from '@/app/assets/icons/hi.png'
import { useLoginStore } from '@/features/auth/login'
import { DashboardTabs } from '@/widgets/DashboardTabs'
import { allTabs, defaultTabByRole } from '@/shared/lib'

import s from './DashboardWrapper.module.scss'

export const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
	const { personalData, getPersonalDataByToken } = useLoginStore()
	const t = useTranslations()

	useEffect(() => {
		if (!personalData) {
			getPersonalDataByToken()
		}
	}, [personalData, getPersonalDataByToken])

	if (!personalData) {
		return null
	}

	// @ts-expect-error fix it
	const role = personalData.role_id.code as 'client' | 'lawyer'
	// @ts-expect-error fix it
	const tabs = allTabs.filter((tab) => !tab.onlyFor || tab.onlyFor === role)
	const defaultTab = defaultTabByRole[role]

	return (
		<div className="little-container">
			<div className={s.box}>
				<div className={s.greetings}>
					<h1 className={s.title}>
						{t('greetings.hello')}, <span>{personalData.name}</span>!
					</h1>
					<Image
						src={HiIcon}
						alt={t('greetings.hi')}
						width={24}
						height={24}
						className={s.hiImg}
					/>
				</div>
				<div className={s.descr}>
					{/*  @ts-expect-error fix it */}
					{personalData.role_id.code === 'client' && <p>{t('description.clientRequest')}</p>}
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
