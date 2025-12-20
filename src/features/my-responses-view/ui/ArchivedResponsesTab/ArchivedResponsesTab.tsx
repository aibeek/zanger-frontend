'use client'

import { useLocale, useTranslations } from 'next-intl'

import { Loader } from '@/shared/ui-kit'
import { ArchivedResponsesList } from '../ArchivedResponsesList'
import { useArchivedResponsesInfinite } from '../../model'

export const ArchivedResponsesTab = () => {
	const locale = useLocale()
	const t = useTranslations()
	const { items, isLoadingMore, isReachingEnd, setSize, size } = useArchivedResponsesInfinite()

	if (size === 0) {
		return <Loader />
	}

	if (!items || items.length === 0) {
		return (
			<div style={{ padding: '20px', textAlign: 'center' }}>
				<p>{t('applications.noArchivedApplications')}</p>
			</div>
		)
	}

	return (
		<ArchivedResponsesList
			items={items}
			loadMore={() => setSize((s) => s + 1)}
			isLoadingMore={isLoadingMore}
			isReachingEnd={isReachingEnd}
		/>
	)
}
