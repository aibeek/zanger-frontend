'use client'

import { useLocale } from 'next-intl'

import { Loader } from '@/shared/ui-kit'
import { defaultClientTab } from '@/shared/lib'
import { EmptyApplicationsAndResponses } from '@/widgets/EmptyApplicationsAndResponses'
import { MyApplicationsList } from '../MyApplicationsList'
import { useMyApplicationsInfinite } from '../../model'

export const MyApplicationsTab = () => {
	const locale = useLocale()
	const { items, isLoadingMore, isReachingEnd, setSize, size, mutate } = useMyApplicationsInfinite()

	if (size === 0) {
		return <Loader />
	}

	if (!items || items.length === 0) {
		return (
			<EmptyApplicationsAndResponses
				redirectUrl={`/${locale}/${defaultClientTab}`}
				buttonContent="Создать заявку"
				descr="Заявок пока нет"
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
