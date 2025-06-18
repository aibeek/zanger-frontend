'use client'

import Image from 'next/image'

import { useEffect, useState } from 'react'
import { Alert } from '@/shared/ui-kit/Alert'
import { Loader } from '@/shared/ui-kit'
import { useLentaAccessStatus } from '@/shared/lib'
import { ClientFaq } from '@/widgets/ClientFaq'
import { AppLink } from '@/shared/ui-kit/AppLink'
import { DashboarEmptyLenta } from '@/widgets/DashboarEmptyLenta'
import AlarmAlertIcon from '@/app/assets/icons/alarm-alert.svg'
import SheetAlertIcon from '@/app/assets/icons/sheet-alert.svg'
import DocsIcon from '@/app/assets/icons/need-to-access-docs.svg'
import { refreshUser } from '@/shared/lib/helpers/refreshUser'

import { LentaList } from '../LentaList'
import s from './LentaTab.module.scss'
import { RegionSwitch } from './RegionSwitch'
import { useLentaInfinite, useLentaStore } from '../../model'

export const LentaTab = () => {
	const { hasAccess, needsDocuments, needsSubscription, hasModerationDocs, documentStatuses } = useLentaAccessStatus()

	const { applyToRequest } = useLentaStore()
	const [allRegions, setAllRegions] = useState(false)

	const { items, isLoadingMore, isReachingEnd, setSize, size, mutate } = useLentaInfinite({ all_regions: allRegions })

	useEffect(() => {
		const interval = setInterval(() => {
			refreshUser()
		}, 30000)

		return () => clearInterval(interval)
	}, [])

	if (hasModerationDocs) {
		return (
			<div className={s.needToAccess}>
				<h3>Доступ к ленте ограничен</h3>
				<p>Ваши документы находятся на модерации.</p>

				<Image
					src={DocsIcon}
					alt="alarm"
					width={308}
					height={308}
				/>
			</div>
		)
	}

	if (!hasAccess) {
		return (
			<div className={s.needToAccess}>
				<h3>Доступ к ленте ограничен</h3>

				{needsDocuments && (
					<>
						<p>Пожалуйста, загрузите необходимые документы</p>

						<ul className={s.docsList}>
							{documentStatuses.map((doc) => (
								<li
									style={
										doc.status === 'fully_uploaded' ? { color: '#09cb09' } : { color: 'ff5b5bfa' }
									}
									className={s.docsItem}
									key={doc.id}>
									{doc.name}: {doc.status === 'fully_uploaded' ? 'Загружен' : 'Не загружен'}
								</li>
							))}
						</ul>
						<Image
							src={DocsIcon}
							alt="alarm"
							width={308}
							height={308}
						/>
						<AppLink
							size="md"
							href="/dashboard/profile?tab=documents">
							Загрузить документы
						</AppLink>
					</>
				)}
			</div>
		)
	}

	if (size === 0) return <Loader />

	if (!items || items.length === 0) {
		return (
			<>
				<RegionSwitch
					value={allRegions}
					onChange={(val) => {
						setAllRegions(val)
						setSize(1)
					}}
				/>
				<DashboarEmptyLenta />
				<ClientFaq />
			</>
		)
	}

	return (
		<>
			<RegionSwitch
				value={allRegions}
				onChange={(val) => {
					setAllRegions(val)
					setSize(1)
				}}
			/>
			{needsSubscription && (
				<Alert
					icon={SheetAlertIcon}
					title="Оформите подписку"
					description={'Чтобы откликаться на заявки, необходимо оформить подписку'}
					link={{ href: '/subscription', label: 'Оформить подписку' }}
				/>
			)}
			{needsDocuments && (
				<Alert
					icon={AlarmAlertIcon}
					title="Вы не заполнили анкету!"
					description={'Чтобы получать заявки от клиентов, необходимо заполнить анкету и пройти верификацию'}
					link={{ href: '/dashboard/profile?tab=documents', label: 'Заполнить анкету' }}
				/>
			)}

			<LentaList
				data={items}
				loadMore={() => setSize((s) => s + 1)}
				isLoadingMore={isLoadingMore}
				isReachingEnd={isReachingEnd}
				applyToRequest={(params: any) => applyToRequest({ ...params, mutate })}
			/>
		</>
	)
}
