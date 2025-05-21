'use client'

import { Loader } from '@/shared/ui-kit'
import { ClientFaq } from '@/widgets/ClientFaq'
import { DashboarEmptyLenta } from '@/widgets/DashboarEmptyLenta'
import { LentaList } from '../LentaList'
import { useLentaInfinite } from '../../model'
import { useLentaStore } from '../../model/lentaStore'

export const LentaTab = () => {
	const { items, isLoadingMore, isReachingEnd, setSize, size, mutate } = useLentaInfinite()

	const { applyToRequest } = useLentaStore()

	if (size === 0) {
		return <Loader />
	}

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
			applyToRequest={(params) => applyToRequest({ ...params, mutate })}
		/>
	)
}
