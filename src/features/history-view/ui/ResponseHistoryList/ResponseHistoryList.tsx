'use client'

import { useRef } from 'react'

import { DescriptionText } from '@/shared/ui-kit'
import { ListLoader } from '@/shared/ui-kit/ListLoader'
import { DateComponent } from '@/shared/ui-kit/DateComponent'
import { useInfiniteScroll } from '@/shared/lib/hooks/useInfiniteScroll'
import { useTranslations } from 'next-intl'

import s from './ResponseHistoryList.module.scss'

export const ResponseHistoryList = ({ items, loadMore, isLoadingMore, isReachingEnd }) => {
	const loadMoreRef = useRef(null)
	const t = useTranslations('history')

	useInfiniteScroll({ loadMore, isLoadingMore, isReachingEnd, loadMoreRef })

	return (
		<div className={s.wrapper}>
			<div className={s.inner}>
				<div className={s.items}>
					{items.map((item) => (
						<article
							className={s.item}
							key={item.id}>
							<div className={s.top}>
								<DateComponent date={item.order.created_at} />

								{item.order && <span className={s.tag}>{item.order.tag.name}</span>}
								<DescriptionText>{item.order.description}</DescriptionText>
							</div>
							<div className={s.bottom}>
								<p>{t('statusLabel')}:</p>
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
