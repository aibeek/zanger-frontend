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

	console.log('MyResponsesTab:', { 
		size, 
		itemsCount: items?.length, 
		isLoadingMore, 
		isReachingEnd,
		items: items?.slice(0, 3) // показываем первые 3 элемента для отладки
	})

	if (size === 0) {
		return <Loader />
	}

	if (!items || items.length === 0) {
		return (
			<div style={{ padding: '20px', textAlign: 'center' }}>
				<p>Нет откликов для отображения</p>
			</div>
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
