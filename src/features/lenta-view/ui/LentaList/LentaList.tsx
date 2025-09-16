'use client'

import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Button, DescriptionText } from '@/shared/ui-kit'
import { DateComponent } from '@/shared/ui-kit/DateComponent'

import s from './LentaList.module.scss'
import { ReportButton } from '@/features/report/ui/ReportButton'
import { useTranslations } from 'next-intl'
import { useLentaAccessStatus } from '@/shared/lib'
import { useMyResponsesInfinite } from '@/features/my-responses-view'

export const LentaList = ({ data, loadMore, isLoadingMore, isReachingEnd, applyToRequest }) => {
	const t = useTranslations('applications')
	const { needsSubscription } = useLentaAccessStatus()
	const { mutate: mutateMyResponses } = useMyResponsesInfinite()

	return (
		<div className={s.wrapper}>
			<div className={s.inner}>
				<div className={s.items}>
					<AnimatePresence>
						{data.map((item) => {
							if (!item || !item.id) return null
							return (
								<motion.article
									key={item.id}
									className={s.item}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0, x: 100 }}
									transition={{ duration: 0.5 }}>
									<div className={s.cardHeader}>
										<h3 className={s.title}>{item.title}</h3>
									</div>
									<div className={s.description}>
										<DescriptionText>{item.description}</DescriptionText>
									</div>
									<div className={s.dataRow}>
										<span className={s.deadline}>{t('deadline')}: {item.deadline}</span>
										<span className={s.clientType}>
											{t('clientType')}: {item.user?.type === 'legal' ? t('legalClient') : t('individualClient')}
										</span>
										<span className={s.publishDate}>
											{t('publishDate')}: <DateComponent date={item.created_at} />
										</span>
									</div>
									<div className={s.bottom}>
										<Button
											className={s.respondBtn}
											variant="primary"
											size="sm"
											onClick={() => {
												if (needsSubscription) {
													toast.error(t('subscribe_required'))
													return
												}
												mutateMyResponses()
												applyToRequest({ order_id: item.id })
											}}>
											{t('respondButton')}
										</Button>
									</div>
								</motion.article>
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
								{isLoadingMore ? 'Загрузка...' : 'Загрузить еще'}
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
