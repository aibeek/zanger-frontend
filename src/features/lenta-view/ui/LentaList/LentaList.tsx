'use client'

import { motion, AnimatePresence } from 'framer-motion'

import { Button, DescriptionText, UserBox } from '@/shared/ui-kit'

import s from './LentaList.module.scss'
import { ReportButton } from '@/features/report/ui/ReportButton'
import { useTranslations } from 'next-intl'

export const LentaList = ({ data, loadMore, isLoadingMore, isReachingEnd, applyToRequest }) => {
	const t = useTranslations('lenta')

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
									<div className={s.top}>
										<UserBox data={item} />
										<div className={s.title}>
											{item.tag && (
												<>
													<span className={s.specialization}>{item.tag.specialization.name}</span>
													<span className={s.tag}>{item.tag.name}</span>
												</>
											)}
										</div>
										<DescriptionText>{item.description}</DescriptionText>
									</div>
									<div className={s.bottom}>
										<Button
											style={{ padding: '8px 30px' }}
											className={s.apply}
											variant="primary"
											size="sm"
											onClick={() => applyToRequest({ order_id: item.id })}>
											{t('respond')}
										</Button>

										<ReportButton
											userId={item.user.id}
											role="client"
										/>
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
								{isLoadingMore ? t('loading') : t('load_more')}
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
