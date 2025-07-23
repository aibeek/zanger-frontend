'use client'

import { useLocale, useTranslations } from 'next-intl'

import { Loader } from '@/shared/ui-kit'
import { defaultLawyerTab } from '@/shared/lib'
import { EmptyApplicationsAndResponses } from '@/widgets/EmptyApplicationsAndResponses'

import { MyResponsesList } from '../MyResponsesList'
import { useMyResponsesInfinite } from '../../model'

export const MyResponsesTab = () => {
	const locale = useLocale()
	const t = useTranslations()
	const { items, isLoadingMore, isReachingEnd, setSize, size } = useMyResponsesInfinite()

	if (size === 0) {
		return <Loader />
	}

	if (!items || items.length === 0) {
		return (
			<EmptyApplicationsAndResponses
				redirectUrl={`/${locale}/${defaultLawyerTab}`}
				buttonContent={t('tabs.historyTab.toApplicationsFeed')}
				descr={t('myApplications.noRequests')}
			/>
		)
	}

	return (
		<MyResponsesList
			items={items}
			loadMore={() => setSize((s) => s + 1)}
			isLoadingMore={isLoadingMore}
			isReachingEnd={isReachingEnd}
		/>
	)
}
