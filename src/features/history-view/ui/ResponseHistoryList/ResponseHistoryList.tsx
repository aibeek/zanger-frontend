'use client'

import { Button, DescriptionText, UserBox } from '@/shared/ui-kit'
import { DateComponent } from '@/shared/ui-kit/DateComponent'
import { useTranslations } from 'next-intl'

import s from './ResponseHistoryList.module.scss'

export const ResponseHistoryList = ({ items, loadMore, isLoadingMore, isReachingEnd }) => {
	const t = useTranslations('history')

	return (
		<div className={s.wrapper}>
			<div className={s.inner}>
				<div className={s.items}>
					{items.map((item) => (
						<article
							className={s.item}
							key={item.id}>
							<div className={s.top}>
								<UserBox data={item} />

								{item.order && <span className={s.tag}>{item.order.tag.name}</span>}
								<DescriptionText>{item.order.description}</DescriptionText>
							</div>
							<div className={s.bottom}>
								<p>{t('statusLabel')}:</p>
								<span className={s.status}>{item.status}</span>
							</div>
						</article>
					))}
					{!isReachingEnd && (
						<div className={s.loadMoreWrapper}>
							<Button
								variant="primary"
								size={'full'}
								disabled={isLoadingMore}
								onClick={loadMore}>
								{isLoadingMore ? t('loading') : t('load_more')}
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
