'use client'

import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, DescriptionText } from '@/shared/ui-kit'
import { DateComponent } from '@/shared/ui-kit/DateComponent'

import s from './MyResponsesList.module.scss'
import { Status, useMyResponsesStore } from '../../model'

export const MyResponsesList = ({ items, loadMore, isLoadingMore, isReachingEnd }) => {
	const { workOut, closeItem, workedOutIds } = useMyResponsesStore()
	const t = useTranslations('applications')

	const statusMap = items.reduce((acc: any, item: any) => {
		acc[item.id] = Object.fromEntries(item.status.map((st: Status) => [st.title, st.is_active]))
		return acc
	}, {})

	const filteredItems = items.filter((item: any) => !workedOutIds.includes(item.id))

	return (
		<div className={s.wrapper}>
			<div className={s.inner}>
				<div className={s.items}>
					<AnimatePresence>
						{filteredItems.map((item: any) => {
							const currentStatusMap = statusMap[item.id]

							return (
								<div key={item.id}>
									<motion.article
										className={s.item}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: 10 }}
										transition={{ duration: 0.3 }}>
										<div className={s.cardHeader}>
											<h3 className={s.title}>{item.order?.title}</h3>
										</div>
										<div className={s.description}>
											<DescriptionText>{item.order.description}</DescriptionText>
										</div>
										<div className={s.dataRow}>
											<span className={s.deadline}>{t('deadline')}: {item.order?.deadline}</span>
											<span className={s.clientType}>
												{t('clientType')}: {item.user?.type === 'legal' ? t('legalClient') : t('individualClient')}
											</span>
											<span className={s.publishDate}>
												{t('publishDate')}: <DateComponent date={item.order?.created_at} />
											</span>
										</div>
										<div className={s.bottom}>
											<Button
												className={s.chatBtn}
												variant="primary"
												size="sm">
												{t('chatButton')}
											</Button>
										</div>
									</motion.article>
								</div>
							)
						})}
					</AnimatePresence>

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
