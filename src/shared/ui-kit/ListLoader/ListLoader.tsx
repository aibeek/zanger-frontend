'use client'

import { SyncLoader } from 'react-spinners'

export function ListLoader({ ref, isLoadingMore }) {
	return (
		<div
			style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}
			ref={ref}>
			{isLoadingMore && <SyncLoader color={'rgba(2, 125, 255, 1)'} />}
		</div>
	)
}
