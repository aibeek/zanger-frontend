'use client'

import { Loader } from '@/shared/ui-kit'
import { useLentaAccessStatus } from '@/shared/lib'
import { ClientFaq } from '@/widgets/ClientFaq'
import { AppLink } from '@/shared/ui-kit/AppLink'
import { DashboarEmptyLenta } from '@/widgets/DashboarEmptyLenta'

import { LentaList } from '../LentaList'
import s from './LentaTab.module.scss'
import { useLentaInfinite, useLentaStore } from '../../model'
import { useEffect } from 'react'
import { refreshUser } from '@/shared/lib/helpers/refreshUser'

export const LentaTab = () => {
	const {
		hasAccess,
		needsDocuments,
		needsSubscription,
		hasModerationDocs,
		documentStatuses,
	} = useLentaAccessStatus()

	const { items, isLoadingMore, isReachingEnd, setSize, size, mutate } = useLentaInfinite()
	const { applyToRequest } = useLentaStore()

	useEffect(() => {
		const interval = setInterval(() => {
			refreshUser()
		}, 10000) // каждые 10 сек
	
		return () => clearInterval(interval)
	}, [])

	if (hasModerationDocs) {
		return (
			<div className={s.needToAccess}>
				<h3>Доступ к ленте ограничен</h3>
				<p>Ваши документы находятся на модерации. Пожалуйста, дождитесь подтверждения.</p>
			</div>
		)
	}

	if (!hasAccess) {
		return (
			<div className={s.needToAccess}>
				<h3>Доступ к ленте ограничен</h3>

				{needsDocuments && (
					<>
						<p>Пожалуйста, загрузите необходимые документы:</p>
						<ul className={s.statusList}>
							{documentStatuses.map((doc) => (
								<li key={doc.id}>
									{doc.name}: {doc.status === 'fully_uploaded'
										? '✅ Загружен'
										: doc.status === 'partially_uploaded'
										? '⚠️ Частично'
										: '❌ Не загружен'}
									{doc.moderation && ' ⏳ На модерации'}
								</li>
							))}
						</ul>

						<AppLink size="md" href="/dashboard/profile?tab=documents">
							Загрузить документы
						</AppLink>
					</>
				)}

				{needsSubscription && (
					<>
						<p>Для доступа также необходимо оформить подписку.</p>
						<AppLink size="md" href="/dashboard/profile?tab=subscription">
							Оформить подписку
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
				<DashboarEmptyLenta />
				<ClientFaq />
			</>
		)
	}

	return (
		<LentaList
			data={items}
			loadMore={() => setSize((s) => s + 1)}
			isLoadingMore={isLoadingMore}
			isReachingEnd={isReachingEnd}
			applyToRequest={(params: any) => applyToRequest({ ...params, mutate })}
		/>
	)
}
