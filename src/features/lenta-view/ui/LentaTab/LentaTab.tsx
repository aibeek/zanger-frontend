'use client'

import { Loader } from '@/shared/ui-kit'
import { useLentaAccessStatus } from '@/shared/lib'
import { ClientFaq } from '@/widgets/ClientFaq'
import { AppLink } from '@/shared/ui-kit/AppLink'
import { DashboarEmptyLenta } from '@/widgets/DashboarEmptyLenta'

import { LentaList } from '../LentaList'
import s from './LentaTab.module.scss'
import { useLentaInfinite, useLentaStore } from '../../model'

export const LentaTab = () => {
	const { hasAccess, needsDocuments, needsSubscription, hasModerationDocs } = useLentaAccessStatus()
	const { items, isLoadingMore, isReachingEnd, setSize, size, mutate } = useLentaInfinite()
	const { applyToRequest } = useLentaStore()

	const onlyDocuments = needsDocuments && !needsSubscription
	const onlySubscription = needsSubscription && !needsDocuments
	const needsAll = needsDocuments && needsSubscription

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
				{onlyDocuments && (
					<AppLink
						size="md"
						href="/dashboard/profile?tab=documents">
						Загрузить документы
					</AppLink>
				)}
				{onlySubscription && (
					<AppLink
						size="md"
						href="/subscription">
						Оформить подписку
					</AppLink>
				)}
				{needsAll && (
					<>
						<p>Оформите подписку и загрузите документы</p>
						<AppLink
							size="md"
							href="/dashboard/profile?tab=documents">
							Загрузить документы
						</AppLink>
						<AppLink
							size="md"
							href="/subscription">
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
