'use client'

import { Button, DescriptionText } from '@/shared/ui-kit'
import { DateComponent } from '@/shared/ui-kit/DateComponent'

import s from './ApplicationHistoryList.module.scss'
import { useTranslations } from 'next-intl'

export const ApplicationHistoryList = ({ items, loadMore, isLoadingMore, isReachingEnd }) => {
	const t = useTranslations('history')

	return (
		<div className={s.wrapper}>
			<div className={s.inner}>
				<div className={s.items}>
					{items.map((item: any) => (
						<article
							className={s.item}
							key={Math.random()}>
							<div className={s.top}>
								<DateComponent date={item.created_at} />

								{item.tag && <span className={s.tag}>{item.tag.name}</span>}
								<DescriptionText>{item.description}</DescriptionText>
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
