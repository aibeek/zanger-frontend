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
										
										{/* Заголовок - тип услуги */}
										<div className={s.cardHeader}>
											<h3 className={s.title}>
												{item.order?.tag?.name || t('service.other')}
											</h3>
										</div>
										
										{/* Описание */}
										<div className={s.description}>
											<DescriptionText>{item.order?.description}</DescriptionText>
										</div>
										
										{/* Информация о клиенте и сроках */}
										<div className={s.dataRow}>
											<div className={s.infoLine}>
												<span className={s.label}>{t('deadline')}:</span>
												<span className={s.value}>{item.order?.deadline || 'Не указан'}</span>
											</div>
											<div className={s.infoLine}>
												<span className={s.label}>{t('clientType')}:</span>
												<span className={s.value}>
													{item.order?.user?.type === 'legal' ? t('legalClient') : t('individualClient')}
												</span>
											</div>
											<div className={s.infoLine}>
												<span className={s.label}>{t('publishDate')}:</span>
												<span className={s.value}>
													<DateComponent date={item.order?.created_at} />
												</span>
											</div>
										</div>
										
										{/* Кнопка действия */}
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
