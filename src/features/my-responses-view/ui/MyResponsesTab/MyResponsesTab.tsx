'use client'

import { useLocale } from 'next-intl'

import { Loader } from '@/shared/ui-kit'
import { defaultLawyerTab } from '@/shared/lib'
import { EmptyApplicationsAndResponses } from '@/widgets/EmptyApplicationsAndResponses'

import { MyResponsesList } from '../MyResponsesList'
import { useMyResponsesInfinite } from '../../model'

export const MyResponsesTab = () => {
	const locale = useLocale()
	const { items, isLoadingMore, isReachingEnd, setSize, size } = useMyResponsesInfinite()

	if (size === 0) {
		return <Loader />
	}

	if (!items || items.length === 0) {
		return (
			<EmptyApplicationsAndResponses
				redirectUrl={`/${locale}/${defaultLawyerTab}`}
				buttonContent={'В ленту заявок'}
				descr={'Заявок пока нет'}
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
