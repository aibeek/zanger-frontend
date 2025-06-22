'use client'

import { useLocale, useTranslations } from 'next-intl'

import { Loader } from '@/shared/ui-kit'
import { defaultClientTab } from '@/shared/lib'
import { EmptyApplicationsAndResponses } from '@/widgets/EmptyApplicationsAndResponses'
import { MyApplicationsList } from '../MyApplicationsList'
import { useMyApplicationsInfinite } from '../../model'

export const MyApplicationsTab = () => {
	const locale = useLocale()
	const { items, isLoadingMore, isReachingEnd, setSize, size, mutate } = useMyApplicationsInfinite()
	const t = useTranslations('myApplications')

	if (size === 0) {
		return <Loader />
	}

	if (!items || items.length === 0) {
		return (
			<EmptyApplicationsAndResponses
				redirectUrl={`/${locale}/${defaultClientTab}`}
				buttonContent={t('createRequest')}
				descr={t('noRequests')}
			/>
		)
	}

	return (
		<MyApplicationsList
			items={items}
			loadMore={() => setSize((s) => s + 1)}
			isLoadingMore={isLoadingMore}
			isReachingEnd={isReachingEnd}
			mutate={mutate}
		/>
	)
}
