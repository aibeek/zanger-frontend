'use client'

import { useRef } from 'react'

import { DescriptionText } from '@/shared/ui-kit'
import { ListLoader } from '@/shared/ui-kit/ListLoader'
import { DateComponent } from '@/shared/ui-kit/DateComponent'
import { useInfiniteScroll } from '@/shared/lib/hooks/useInfiniteScroll'

import s from './ApplicationHistoryList.module.scss'

export const ApplicationHistoryList = ({ items, loadMore, isLoadingMore, isReachingEnd }) => {
	const loadMoreRef = useRef(null)

	useInfiniteScroll({ loadMore, isLoadingMore, isReachingEnd, loadMoreRef })

	return (
		<div className={s.wrapper}>
			<div className={s.inner}>
				<div className={s.items}>
					{items.map((item) => (
						<article
							className={s.item}
							key={Math.random()}>
							<div className={s.top}>
								<DateComponent date={item.created_at} />

								{item.tag && <span className={s.tag}>{item.tag.name}</span>}
								<DescriptionText>{item.description}</DescriptionText>
							</div>
							<div className={s.bottom}>
								<p>Статус:</p>
								<span className={s.status}>{item.status}</span>
							</div>
						</article>
					))}
					<ListLoader
						ref={loadMoreRef}
						isLoadingMore={isLoadingMore}
					/>
				</div>
			</div>
		</div>
	)
}
